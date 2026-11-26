import json, sys, re, os, shutil
vid=sys.argv[1]; d=f'videos/{vid}'
if not os.path.exists(f'{d}/spec_v1.json'): shutil.copy(f'{d}/spec.json', f'{d}/spec_v1.json')
s=json.load(open(f'{d}/spec_v1.json')); ev=s['events']
js=open(f'{d}/video.js').read(); refs=set(re.findall(r"line\('([^']+)'\)", js))
widx=[i for i,e in enumerate(ev) if e[0]!='A' and e[0]!='P' and len(e)>2 and isinstance(e[2],dict) and e[2].get('worse')][0]
pairs=[i for i in range(widx) if ev[i][0]=='A' and i+1<len(ev) and ev[i+1][0]=='N']
k=len(pairs); drop=set()
if k>3:
    cand=[p for p in pairs[1:-1] if not any(ev[p+1][1].startswith(r) for r in refs)]
    nd=k-3; step=len(cand)/nd if nd else 1
    drop={cand[int(i*step)] for i in range(min(nd,len(cand)))}
new=[]
for i,e in enumerate(ev):
    if i-1 in drop and e[0]=='N': continue
    if i in drop: e=['A',e[1],{**(e[2] if len(e)>2 else {}),'dur':0.6,'off':0.25}]
    new.append(e)
# loop line after fact
new.append(['N',"So never ask:",{'loop':1,'gap':0.25}])
s['events']=new; s['cold']=0.9; s['tail']=0.12
v=s.get('voices',{}); v['N']=['am_michael',1.2,'en-us']; s['voices']=v
FIX={'15-coffee':{'35.9':('L:Dale blows',0.3)},'28-candles':{'36.4':('L:Dale takes',0.9)},'14-skip':{'37.6':('L:Ow',-0.81),'38.05':('L:Ow',-0.36),'38.1':('L:Ow',-0.31)}}
sf=[]
for e in s.get('sfx',[]):
    a=e['at']
    if re.match(r'^[0-9.]+$',a):
        if a in FIX.get(vid,{}): r,o=FIX[vid][a]; e={**e,'at':r,'off':e.get('off',0)+o}
        else: continue
    sf.append(e)
s['sfx']=sf
json.dump(s,open(f'{d}/spec.json','w'),indent=1,ensure_ascii=False)
print(vid,'pairs',k,'dropped',[ev[p][1] for p in drop])
