import numpy as np, soundfile as sf, json, sys
from scipy.signal import butter, sosfilt
d=sys.argv[1]; spec=json.load(open(f'{d}/spec.json')); M=spec.get('music',{})
SR=48000; rng=np.random.default_rng(M.get('seed',7))
tl=json.load(open(f'{d}/timeline.json')); D=tl['dur']+0.6; N=int(D*SR)
lines=[x for x in tl['tl'] if x['type']=='line']; acts=[x for x in tl['tl'] if x['type']=='act']
worse=[l for l in lines if l.get('worse')][0]['t']; fact=[l for l in lines if l.get('fact')][0]['t']
after=[a for a in acts if a['t']>worse]; big=after[0]['blast'] if after else worse+1.6
pre=[a for a in acts if a['t']<worse]; s1=pre[len(pre)//3]['t'] if pre else 15; s2=pre[(2*len(pre))//3]['t'] if pre else 30
out=np.zeros(N)
def lp(x,f): return sosfilt(butter(2,f,'low',fs=SR,output='sos'),x)
def hp(x,f): return sosfilt(butter(2,f,'high',fs=SR,output='sos'),x)
def bp(x,a,b): return sosfilt(butter(2,[a,b],'band',fs=SR,output='sos'),x)
def add(sig,t,g=1.0):
    i=int(t*SR)
    if i>=N or t<0: return
    j=min(N,i+len(sig)); out[i:j]+=sig[:j-i]*g
mid=lambda m: 440*2**((m-69)/12)
def ks(f,dur,damp=0.996):
    n=int(dur*SR); p=max(2,int(SR/f)); b=lp(rng.uniform(-1,1,p),f*6); y=np.zeros(n); idx=0
    for i in range(n):
        v=b[idx]; b[idx]=damp*0.5*(v+b[(idx+1)%p]); y[i]=v; idx=(idx+1)%p
    y*=np.exp(-np.arange(n)/SR*4.0); return y/(np.abs(y).max()+1e-9)
cache={}
def pluck(m,dur=0.35,damp=0.994):
    k=(m,dur,damp)
    if k not in cache: cache[k]=ks(mid(m),dur,damp)
    return cache[k]
def kick(): n=int(0.35*SR); t=np.arange(n)/SR; f=np.geomspace(150,45,n); return np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*9)
def hat(): n=int(0.05*SR); return hp(rng.standard_normal(n),7000)*np.exp(-np.arange(n)/SR*90)
def clap():
    n=int(0.2*SR); x=bp(rng.standard_normal(n),900,3000); e=np.exp(-np.arange(n)/SR*25)
    for dd in (0.01,0.02): e[int(dd*SR):]+=np.exp(-np.arange(n-int(dd*SR))/SR*60)*0.6
    return x*e
def bell(m,dur=1.2): n=int(dur*SR); t=np.arange(n)/SR; f=mid(m); return (np.sin(2*np.pi*f*t)+0.4*np.sin(2*np.pi*f*2.76*t)+0.2*np.sin(2*np.pi*f*5.4*t))*np.exp(-t*3.5)
def pad(ms,dur,att=1.0):
    n=int(dur*SR); t=np.arange(n)/SR; s=sum(np.sin(2*np.pi*mid(m)*t*(1+q))+0.5*np.sin(2*np.pi*mid(m)*2*t*(1-q)) for m in ms for q in (-0.003,0.003))
    return lp(s,1800)*np.minimum(1,t/att)*np.minimum(1,np.maximum(0,(dur-t))/0.8)/len(ms)
STYLES={
 'sneaky':{'prog':[[50,57,62,38],[50,57,62,38],[55,58,62,43],[57,61,64,45]],'mel':[[74,None,76,77,None,81,None,80],[81,None,77,None,76,74,None,None],[79,None,77,79,None,82,None,79],[81,None,None,76,None,73,None,None]],'bpm':124,'swing':0},
 'bouncy':{'prog':[[48,52,55,36],[53,57,60,41],[55,59,62,43],[48,52,55,36]],'mel':[[72,None,76,None,79,None,76,None],[77,None,81,79,77,None,None,None],[79,None,74,None,71,74,None,None],[72,76,79,84,None,79,None,None]],'bpm':118,'swing':0.06},
 'mystery':{'prog':[[45,52,57,33],[45,52,57,33],[41,48,53,29],[40,47,52,28]],'mel':[[69,None,72,None,76,None,75,None],[76,None,72,None,69,None,None,None],[65,None,69,None,72,None,71,None],[71,None,68,None,64,None,None,None]],'bpm':112,'swing':0},
 'march':{'prog':[[43,50,55,31],[43,50,55,31],[48,52,55,36],[50,54,57,38]],'mel':[[67,67,None,71,None,74,None,None],[74,None,72,71,None,69,None,None],[72,None,76,None,79,None,76,None],[74,None,None,72,None,71,69,None]],'bpm':128,'swing':0},
}
S=STYLES[M.get('style','sneaky')]; tr=M.get('transpose',0)
bpm=M.get('bpm',S['bpm']); beat=60/bpm; bar=4*beat; prog=[[x+tr for x in c] for c in S['prog']]; mel=[[None if m is None else m+tr for m in b] for b in S['mel']]
t=0.0; b=0
while t<worse-0.05:
    sec=0 if t<s1 else (1 if t<s2 else 2); ch=prog[b%4]; root=ch[3]
    for k in range(8):
        tt=t+k*beat/2+(S['swing']*beat if k%2 else 0)
        if tt>=worse-0.05: break
        if k in (0,4): add(pluck(root,0.3,0.99),tt,0.55)
        if k in (2,6): add(pluck(root+7,0.3,0.99),tt,0.45)
        if sec>=1 and k in (3,7): add(pluck(root+12,0.2,0.99),tt,0.3)
        m=mel[b%4][k]
        if m is not None and (sec>=1 or b%2==0 or k<4): add(pluck(m-12+(12 if sec==2 else 0),0.25),tt,0.32)
        if sec>=1: add(hat(),tt,0.10 if k%2 else 0.16)
        if sec>=1 and k in (0,4): add(kick(),tt,0.55)
        if sec==2 and k in (2,6): add(clap(),tt,0.35)
        if sec==2 and m is not None and k%2==0: add(bell(m,0.6),tt,0.06)
    t+=bar; b+=1
for a in pre[-2:]: x=hp(rng.standard_normal(int(1.5*SR)),1500)*np.linspace(0,1,int(1.5*SR))**2; add(x,a['t']-1.2,0.12)
r0=prog[0][3]
add(kick(),worse,0.9); add(pad([r0,r0+7,r0+12],big-worse+0.2,0.3),worse,0.5)
add(pad([prog[0][0],prog[0][1],prog[0][2],prog[0][2]+3],max(0.5,fact-big+0.4),0.4),big,0.6)
tt=big; i=0
while tt<fact-0.2:
    add(kick(),tt,0.7)
    if i%2==1: add(clap(),tt,0.4)
    add(hat(),tt+beat/2,0.12)
    if i%4==0: add(bell(mel[(i//4)%4][0] or 74,1.4),tt,0.12)
    tt+=beat; i+=1
tt=fact; b=0; end=D-0.6
while tt<end-bar:
    for k in range(8):
        m=mel[b%4][k]
        if m is not None: add(pluck(m-12,0.3),tt+k*beat/2,0.25)
        if k in (0,4): add(pluck(prog[b%4][3],0.3,0.99),tt+k*beat/2,0.4)
    tt+=bar; b+=1
for m in prog[0][:3]+[prog[0][2]+12]: add(pluck(m,1.2,0.998),end-0.3,0.25)
add(bell(prog[0][2]+12,1.5),end-0.3,0.1)
out=lp(out,9000); out/=np.abs(out).max()*1.02
sf.write(f'{d}/music.wav',out,SR); print('music ok')
