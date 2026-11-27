import numpy as np, soundfile as sf, json, sys
d=sys.argv[1]; tl=json.load(open(f'{d}/timeline.json')); SR=24000; D=tl['dur']+0.3; N=int(D*SR); m=np.zeros(N); r=np.random.default_rng(7)
def add(sig,t,g=1):
    i=int(t*SR); j=min(N,i+len(sig)); 
    if i<N: m[i:j]+=sig[:j-i]*g
tt=lambda s:np.arange(int(s*SR))/SR
def kick(): t=tt(0.35); return np.sin(2*np.pi*np.cumsum(np.geomspace(140,45,len(t)))/SR)*np.exp(-t*9)
def snare(): t=tt(0.2); return (r.standard_normal(len(t))*0.6+np.sin(2*np.pi*190*t)*0.5)*np.exp(-t*18)
def hat(): t=tt(0.05); return r.standard_normal(len(t))*np.exp(-t*90)*0.35
def keys(f,s): t=tt(s); return sum(np.sin(2*np.pi*f*k*t)/k for k in (1,2,3))*np.exp(-t*2.2)*0.25
BPM=96; b=60/BPM; prog=[[261.6,329.6,392],[220,261.6,329.6],[174.6,220,261.6],[196,246.9,293.7]]
t=0; i=0
while t<D:
    bar=i//4; beat=i%4
    if beat in (0,) or (beat==2 and bar%2): add(kick(),t,0.9)
    if beat in (1,3): add(snare(),t,0.5)
    for h in (0,0.5): add(hat(),t+h*b,0.6)
    if beat==0:
        for f in prog[bar%4]: add(keys(f,b*4),t,0.5)
    t+=b; i+=1
# starts with small riser-free hit
m=m/np.abs(m).max()*0.5; sf.write(f'{d}/music.wav',m.astype(np.float32),SR)
