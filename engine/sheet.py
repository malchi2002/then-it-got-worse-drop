import sys,glob
from PIL import Image
d=sys.argv[1]; fs=sorted(glob.glob(f'{d}/stills/s_*.jpg'),key=lambda f: float(f.split('s_')[-1][:-4]))
cols=6; rows=(len(fs)+cols-1)//cols; sh=Image.new('RGB',(270*cols,480*rows))
for i,f in enumerate(fs): sh.paste(Image.open(f).resize((270,480)),((i%cols)*270,(i//cols)*480))
sh.save(f'{d}/sheet.jpg',quality=82); print(f'{d}/sheet.jpg')
