import numpy as np, soundfile as sf, json, sys, os
from scipy.signal import butter, sosfilt, resample
d=sys.argv[1]; spec=json.load(open(f'{d}/spec.json'))
SR=48000; tl=json.load(open(f'{d}/timeline.json')); D=tl['dur']+0.6; N=int(D*SR)
voice=np.zeros(N); sfx=np.zeros(N); r=np.random.default_rng(1)
def load(p):
    x,s=sf.read(p); x=x if x.ndim==1 else x.mean(1); return resample(x,int(len(x)*SR/s))
v=load(f'{d}/voice.wav'); voice[:len(v)]+=v[:N]
def add(sig,t,g=1.0):
    i=int(t*SR)
    if i<0: sig=sig[-i:]; i=0
    if i>=N: return
    j=min(N,i+len(sig)); sfx[i:j]+=sig[:j-i]*g
def env(n,a,dec): e=np.ones(n); A=int(a*SR); e[:A]=np.linspace(0,1,A) if A>0 else 1; return e*np.exp(-np.arange(n)/(dec*SR))
def bp(x,lo,hi): return sosfilt(butter(2,[lo,hi],'band',fs=SR,output='sos'),x)
def lp(x,f): return sosfilt(butter(2,f,'low',fs=SR,output='sos'),x)
def hp(x,f): return sosfilt(butter(2,f,'high',fs=SR,output='sos'),x)
def noise(s): return r.standard_normal(int(s*SR))
def boom(s,f0=120,f1=28,dec=0.4):
    n=int(s*SR); f=np.geomspace(f0,f1,n); return np.sin(2*np.pi*np.cumsum(f)/SR)*env(n,0.005,dec)+lp(noise(s),400)*env(n,0.002,dec*0.6)*0.6
def whoosh(s=0.8): n=int(s*SR); return bp(noise(s),300,4000)*np.hanning(n)
def crack(): return hp(noise(0.08),1500)*env(int(0.08*SR),0.0005,0.02)
def glass(s=3):
    g=np.zeros(int(s*SR))
    for i in range(260):
        p=int(r.random()**1.6*(s-0.1)*SR); x=hp(noise(0.03),3500)*env(int(0.03*SR),0.0005,0.008); g[p:p+len(x)]+=x*r.random()
    return g
def wind(s): n=int(s*SR); return lp(noise(s),700)*(0.7+0.3*np.sin(np.linspace(0,9,n)))*env(n,0.2,s*0.8)
def screech(s):
    n=int(s*SR); tt=np.arange(n)/SR; f=2400+300*np.sin(2*np.pi*7*tt); x=np.sign(np.sin(2*np.pi*np.cumsum(f)/SR)); return bp(x,1800,4200)*env(n,0.05,s*0.7)*0.5+bp(noise(s),2000,7000)*env(n,0.05,s*0.6)*0.3
def roar(s): return lp(noise(s),1200)*env(int(s*SR),0.05,s*0.45)
def thud(): return boom(0.5,90,40,0.12)
def splash(s=1.5): n=int(s*SR); return bp(noise(s),400,6000)*env(n,0.01,0.35)
def riser(s): n=int(s*SR); return np.sin(2*np.pi*np.cumsum(np.linspace(40,90,n))/SR)*np.linspace(0,1,n)**2+lp(noise(s),200)*np.linspace(0,1,n)**2*0.6
def ding(): n=int(1.2*SR); t=np.arange(n)/SR; return (np.sin(2*np.pi*1320*t)+0.5*np.sin(2*np.pi*1980*t))*np.exp(-t*4)
def pop(): n=int(0.06*SR); t=np.arange(n)/SR; return np.sin(2*np.pi*np.geomspace(900,200,n)*t)*np.exp(-t*60)
def hum(s,f=110): n=int(s*SR); t=np.arange(n)/SR; return (np.sin(2*np.pi*f*t)+0.4*np.sin(2*np.pi*2*f*t))*env(n,0.1,s)
GEN={'boom':lambda o:boom(o.get('dur',2),o.get('f0',120),o.get('f1',28),o.get('dec',0.6)),'whoosh':lambda o:whoosh(o.get('dur',0.8)),'crack':lambda o:crack(),'glass':lambda o:glass(o.get('dur',3)),
     'wind':lambda o:wind(o.get('dur',4)),'screech':lambda o:screech(o.get('dur',4)),'roar':lambda o:roar(o.get('dur',4)),'thud':lambda o:thud(),'splash':lambda o:splash(o.get('dur',1.5)),
     'riser':lambda o:riser(o.get('dur',1.6)),'ding':lambda o:ding(),'pop':lambda o:pop(),'hum':lambda o:hum(o.get('dur',2),o.get('f',110))}
acts={x['n']:x for x in tl['tl'] if x['type']=='act'}; lines=[x for x in tl['tl'] if x['type']=='line']
def at(ref):
    if ref.startswith('A'): return acts[int(ref[1:])]['blast']
    if ref=='worse': return [l for l in lines if l.get('worse')][0]['t']
    if ref=='fact': return [l for l in lines if l.get('fact')][0]['t']
    return float(ref)
# default per-act sound: action clip (if any) + whoosh + boom scaled by rank
order=sorted(acts); rank={n:i for i,n in enumerate(order)}
for n,a in acts.items():
    k=rank[n]/max(1,len(order)-1)
    if os.path.exists(f'{d}/act_{n}.wav'): add(load(f'{d}/act_{n}.wav'),a['t'],a.get('sayGain',0.9))
    add(whoosh(0.6),a['blast']-0.3,0.12+0.2*k)
    if k>0.15: add(boom(1.2+k*2,120,28,0.25+k*0.6),a['blast'],0.2+0.7*k)
for e in spec.get('sfx',[]): add(GEN[e['type']](e),at(e['at'])+e.get('off',0),e.get('gain',1))
m=load(f'{d}/music.wav'); mus=np.zeros(N); mus[:min(N,len(m))]=m[:N]*spec.get('musicGain',0.32)
venv=np.convolve(np.abs(voice),np.ones(int(0.15*SR))/(0.15*SR),'same'); duck=1-0.45*np.clip(venv/0.03,0,1)
o=voice+sfx*0.55+mus*duck; o/=max(1e-6,np.abs(o).max())*1.05
sf.write(f'{d}/mix.wav',np.stack([o,o],1),SR); print('mix ok')
