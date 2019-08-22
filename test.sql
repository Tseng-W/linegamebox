SELECT * FROM public."HERO_DATA";

UPDATE public."HERO_DATA" SET "picture" = 'https://i.imgur.com/guCx8Lt.jpg' 
WHERE "heroName" LIKE '%阿比%'

INSERT INTO public."HERO_DATA" ("heroName","star","picture","nickName")
VALUES ('山之翁',5,'https://i.imgur.com/E71UHTc.jpg','{"山之翁","告死天使","初代哈桑","爺爺","山中老人","王哈桑"}')

INSERT INTO public."HERO_DATA" ("heroName","star","nickName")
VALUES ('俄里翁',5,'{"俄里翁","月神"}')

ALTER TABLE public."HERO_DATA" ADD isLimited BOOL DEFAULT FALSE;

UPDATE public."HERO_DATA" SET "islimited" = false
WHERE "picture" IS null