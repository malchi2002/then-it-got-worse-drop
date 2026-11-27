import numpy as np, soundfile as sf, json, re, sys, os
from kokoro_onnx import Kokoro
d=sys.argv[1]; spec=json.load(open(f'{d}/spec.json'))
MODEL=os.environ.get('KOKORO_MODEL','/home/claude/dl/kokoro-q8.onnx'); VOICES=os.environ.get('KOKORO_VOICES','/home/claude/dl/voices.npz')
K=Kokoro(MODEL,VOICES); SR=24000
VO={'N':('am_michael',1.08,'en-us'),'I':('bm_george',1.0,'en-gb'),'X':('am_puck',1.1,'en-us'),'F':('af_bella',1.05,'en-us')}
VO.update({k:tuple(v) for k,v in spec.get('voices',{}).items()})
import subprocess, hashlib, urllib.request
def el(text,vid,opt):
    key=open('/home/claude/.el_key').read().strip(); body=json.dumps({'text':text,'model_id':opt.get('model','eleven_multilingual_v2'),'voice_settings':{'stability':opt.get('stability',0.3),'similarity_boost':0.8,'style':opt.get('style',0.7),'use_speaker_boost':True,'speed':opt.get('speed',1.1)}}).encode()
    h=hashlib.md5(body+vid.encode()).hexdigest(); cp=f'/home/claude/el/cache_{h}.mp3'
    if not os.path.exists(cp):
        rq=urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{vid}?output_format=mp3_44100_128',data=body,headers={'xi-api-key':key,'Content-Type':'application/json'})
        open(cp,'wb').write(urllib.request.urlopen(rq,timeout=90).read())
    raw=subprocess.run(['ffmpeg','-v','error','-i',cp,'-f','f32le','-ac','1','-ar',str(SR),'-'],capture_output=True).stdout
    return np.frombuffer(raw,np.float32).copy()
def tts(text,who):
    vv=VO[who]
    if vv[0]=='el': s=el(text,vv[1],vv[2] if len(vv)>2 else {})
    else:
        v,sp,lang=vv; s,sr=K.create(text,voice=v,speed=sp,lang=lang); s=np.asarray(s,np.float32)
    a=np.abs(s); idx=np.where(a>0.02*a.max())[0]; return s[max(0,idx[0]-240):idx[-1]+480]
out=[]; tl=[]; t=0.0; say=[]
COLD=spec.get('cold',0)
def add(seg,gap):
    global t; out.append(np.zeros(int(gap*SR),np.float32)); t+=gap; st=t; out.append(seg); t+=len(seg)/SR; return st
HOOK=spec.get('hook'); HK=None
if HOOK:
    hs=tts(HOOK['say'],'N'); out.append(np.zeros(int(0.06*SR),np.float32)); out.append(hs); hd=len(hs)/SR
    COLD=round(0.06+hd+0.3,3); out.append(np.zeros(int(0.3*SR),np.float32)); t=COLD
    HK={'say':HOOK['say'],'rows':HOOK['rows'],'t':0.06,'end':0.06+hd}
elif COLD: out.append(np.zeros(int(COLD*SR),np.float32)); t+=COLD
for e in spec['events']:
    if e[0]=='A':
        n=e[1]; meta=e[2] if len(e)>2 else {}; dur=meta.get('dur',0.6); off=meta.get('off',0.3)
        st=add(np.zeros(int(dur*SR),np.float32),meta.get('gap',0.12)); tl.append({'type':'act','n':n,'t':st,'blast':st+off,'end':t,**meta}); continue
    if e[0]=='P': add(np.zeros(int(e[1]*SR),np.float32),0); continue
    who,text=e[0],e[1]; meta=e[2] if len(e)>2 else {}
    seg=tts(meta.get('say',text),who); gap=meta.get('gap',0.18 if who=='N' else 0.22)
    if meta.get('worse'): gap=0.55
    st=add(seg,gap); en=t
    words=text.split(); w=np.array([len(re.sub(r'\W','',x))+2 for x in words],float); dur=en-st; cs=np.concatenate([[0],np.cumsum(w)])/w.sum()*dur
    tl.append({'type':'line','who':who,'text':text,'t':st,'end':en,**meta,'words':[{'w':words[i],'t':round(st+cs[i],3),'e':round(st+cs[i+1],3)} for i in range(len(words))]})
    if meta.get('worse'): add(np.zeros(int(0.45*SR),np.float32),0)
add(np.zeros(int(spec.get('tail',0.6)*SR),np.float32),0)
sf.write(f'{d}/voice.wav',np.concatenate(out),SR)
# action voice clips (e.g. "hic!") rendered separately for SFX track
clips={}
for x in tl:
    if x['type']=='act' and x.get('say'):
        c=tts(x['say'],x.get('sayWho','X')); sf.write(f"{d}/act_{x['n']}.wav",c,SR)
acts=[x for x in tl if x['type']=='act']
coldAt=(acts[-1]['blast']+spec.get('coldOff',1.0)) if acts else 0
json.dump({'dur':t,'tl':tl,'cold':COLD,'coldAt':coldAt,'hook':HK},open(f'{d}/timeline.json','w'),indent=1)
print('total',round(t,2))
for x in tl: print(round(x['t'],2),x['type'],x.get('text',x.get('n')))
