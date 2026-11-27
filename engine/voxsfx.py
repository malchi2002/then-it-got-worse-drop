import json
def LL(v): return [l for l in json.load(open(f'videos/{v}/timeline.json'))['tl'] if l['type']=='line']
def put(v,sfx):
    p=f'videos/{v}/spec.json'; s=json.load(open(p)); s['sfx']=sfx; json.dump(s,open(p,'w'),indent=1)
def mk(v):
    ls=LL(v); T=lambda p:[x for x in ls if x['text'].startswith(p)][0]
    return ls,T,[{'type':'whoosh','at':str(x['t']-0.2),'gain':0.6} for x in ls if x['text'].startswith('Day')]
ls,T,days=mk('30-k'); ks=[x['t'] for x in ls if x['text']=='K.']
pops=[T('Day one')['t']+1.2,T('He replies')['t']+0.6,T('Day three')['t']+1,ks[0],T('Day seven')['t']+1.3,ks[1],T('Day twelve')['t']+1.3,ks[2],T("It's him")['t'],ks[3]]
put('30-k',days+[{'type':'pop','at':str(p),'gain':1.5} for p in pops]+[{'type':'ding','at':str(T("It's him")['t']-0.6),'gain':0.6},{'type':'boom','at':str(T('So you')['end']+1.3),'dur':1.2,'gain':0.8}])
ls,T,days=mk('31-screen')
put('31-screen',days+[{'type':'pop','at':str(T(p)['t']+o),'gain':1.5} for p,o in [('Mom texts',0.3),('She still',0.2),("She's",0.2),('Mom panics',0.1),('So you',0.9)]])
ls,T,days=mk('32-lie')
pp=[T('You say yes')['t']+0.55,T('Day five')['end']+0.1,T("You haven't")['end']+0.05,T('Day twenty')['t'],T('Day thirty')['t']]
put('32-lie',days+[{'type':'pop','at':str(p),'gain':1.6} for p in pp]+[{'type':'pop','at':str(T('Day ten')['t']+1.6),'gain':1.2},{'type':'boom','at':str(T('You say no')['t']+0.75),'dur':1.6,'gain':1.0}])
ls,T,days=mk('33-thoughts'); put('33-thoughts',days)
