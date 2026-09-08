-- Generado por scripts/generar-edificio.mjs. No editar a mano.
insert into proyectos (id,nombre,distrito,descripcion,entrega_estimada,meta) values ('jardines-carabayllo','Residencial Los Jardines de Carabayllo','Carabayllo, Lima','Condominio de vivienda social de 12 pisos con 96 departamentos, áreas verdes, lobby y locales comerciales en el primer nivel. Frente al parque zonal y a dos cuadras de la Av. Túpac Amaru.','2027-12','{"constructora":"Constructora Demo S.A.C. (ficticia)","direccion":"Av. Los Jardines 1200, Carabayllo"}'::jsonb);
insert into tipologias (id,proyecto_id,codigo,nombre,dormitorios,banos,area_m2,precio_base,asset_interior) values ('A','jardines-carabayllo','A','Tipología A · 2 dormitorios',2,1,55,165000,'/tipologias/A.json');
insert into tipologias (id,proyecto_id,codigo,nombre,dormitorios,banos,area_m2,precio_base,asset_interior) values ('B','jardines-carabayllo','B','Tipología B · 3 dormitorios',3,2,68,198000,'/tipologias/B.json');
insert into tipologias (id,proyecto_id,codigo,nombre,dormitorios,banos,area_m2,precio_base,asset_interior) values ('C','jardines-carabayllo','C','Tipología C · 1 dormitorio',1,1,42,129000,'/tipologias/C.json');
insert into unidades (id,proyecto_id,tipologia_id,piso,posicion,orientacion,vista,precio,estado) values
('P01-N1','jardines-carabayllo','A',1,'N1','norte','parque',171000,'vendido'),
('P01-N2','jardines-carabayllo','B',1,'N2','norte','parque',204000,'vendido'),
('P01-N3','jardines-carabayllo','A',1,'N3','norte','parque',171000,'vendido'),
('P01-E','jardines-carabayllo','C',1,'E','este','ciudad',131500,'disponible'),
('P01-S3','jardines-carabayllo','A',1,'S3','sur','avenida',165000,'vendido'),
('P01-S2','jardines-carabayllo','B',1,'S2','sur','avenida',198000,'vendido'),
('P01-S1','jardines-carabayllo','A',1,'S1','sur','avenida',165000,'disponible'),
('P01-W','jardines-carabayllo','C',1,'W','oeste','cerros',130500,'vendido'),
('P02-N1','jardines-carabayllo','A',2,'N1','norte','parque',171900,'vendido'),
('P02-N2','jardines-carabayllo','B',2,'N2','norte','parque',204900,'vendido'),
('P02-N3','jardines-carabayllo','A',2,'N3','norte','parque',171900,'vendido'),
('P02-E','jardines-carabayllo','C',2,'E','este','ciudad',132400,'vendido'),
('P02-S3','jardines-carabayllo','A',2,'S3','sur','avenida',165900,'vendido'),
('P02-S2','jardines-carabayllo','B',2,'S2','sur','avenida',198900,'vendido'),
('P02-S1','jardines-carabayllo','A',2,'S1','sur','avenida',165900,'vendido'),
('P02-W','jardines-carabayllo','C',2,'W','oeste','cerros',131400,'disponible'),
('P03-N1','jardines-carabayllo','A',3,'N1','norte','parque',172800,'vendido'),
('P03-N2','jardines-carabayllo','B',3,'N2','norte','parque',205800,'separado'),
('P03-N3','jardines-carabayllo','A',3,'N3','norte','parque',172800,'vendido'),
('P03-E','jardines-carabayllo','C',3,'E','este','ciudad',133300,'vendido'),
('P03-S3','jardines-carabayllo','A',3,'S3','sur','avenida',166800,'disponible'),
('P03-S2','jardines-carabayllo','B',3,'S2','sur','avenida',199800,'disponible'),
('P03-S1','jardines-carabayllo','A',3,'S1','sur','avenida',166800,'disponible'),
('P03-W','jardines-carabayllo','C',3,'W','oeste','cerros',132300,'vendido'),
('P04-N1','jardines-carabayllo','A',4,'N1','norte','parque',173700,'disponible'),
('P04-N2','jardines-carabayllo','B',4,'N2','norte','parque',206700,'disponible'),
('P04-N3','jardines-carabayllo','A',4,'N3','norte','parque',173700,'vendido'),
('P04-E','jardines-carabayllo','C',4,'E','este','ciudad',134200,'disponible'),
('P04-S3','jardines-carabayllo','A',4,'S3','sur','avenida',167700,'disponible'),
('P04-S2','jardines-carabayllo','B',4,'S2','sur','avenida',200700,'vendido'),
('P04-S1','jardines-carabayllo','A',4,'S1','sur','avenida',167700,'vendido'),
('P04-W','jardines-carabayllo','C',4,'W','oeste','cerros',133200,'vendido'),
('P05-N1','jardines-carabayllo','A',5,'N1','norte','parque',174600,'disponible'),
('P05-N2','jardines-carabayllo','B',5,'N2','norte','parque',207600,'vendido'),
('P05-N3','jardines-carabayllo','A',5,'N3','norte','parque',174600,'separado'),
('P05-E','jardines-carabayllo','C',5,'E','este','ciudad',135100,'vendido'),
('P05-S3','jardines-carabayllo','A',5,'S3','sur','avenida',168600,'vendido'),
('P05-S2','jardines-carabayllo','B',5,'S2','sur','avenida',201600,'disponible'),
('P05-S1','jardines-carabayllo','A',5,'S1','sur','avenida',168600,'disponible'),
('P05-W','jardines-carabayllo','C',5,'W','oeste','cerros',134100,'disponible'),
('P06-N1','jardines-carabayllo','A',6,'N1','norte','parque',175500,'vendido'),
('P06-N2','jardines-carabayllo','B',6,'N2','norte','parque',208500,'vendido'),
('P06-N3','jardines-carabayllo','A',6,'N3','norte','parque',175500,'disponible'),
('P06-E','jardines-carabayllo','C',6,'E','este','ciudad',136000,'vendido'),
('P06-S3','jardines-carabayllo','A',6,'S3','sur','avenida',169500,'vendido'),
('P06-S2','jardines-carabayllo','B',6,'S2','sur','avenida',202500,'separado'),
('P06-S1','jardines-carabayllo','A',6,'S1','sur','avenida',169500,'vendido'),
('P06-W','jardines-carabayllo','C',6,'W','oeste','cerros',135000,'separado'),
('P07-N1','jardines-carabayllo','A',7,'N1','norte','parque',176400,'vendido'),
('P07-N2','jardines-carabayllo','B',7,'N2','norte','parque',209400,'disponible'),
('P07-N3','jardines-carabayllo','A',7,'N3','norte','parque',176400,'separado'),
('P07-E','jardines-carabayllo','C',7,'E','este','ciudad',136900,'disponible'),
('P07-S3','jardines-carabayllo','A',7,'S3','sur','avenida',170400,'disponible'),
('P07-S2','jardines-carabayllo','B',7,'S2','sur','avenida',203400,'vendido'),
('P07-S1','jardines-carabayllo','A',7,'S1','sur','avenida',170400,'disponible'),
('P07-W','jardines-carabayllo','C',7,'W','oeste','cerros',135900,'disponible'),
('P08-N1','jardines-carabayllo','A',8,'N1','norte','parque',177300,'disponible'),
('P08-N2','jardines-carabayllo','B',8,'N2','norte','parque',210300,'disponible'),
('P08-N3','jardines-carabayllo','A',8,'N3','norte','parque',177300,'vendido'),
('P08-E','jardines-carabayllo','C',8,'E','este','ciudad',137800,'disponible'),
('P08-S3','jardines-carabayllo','A',8,'S3','sur','avenida',171300,'disponible'),
('P08-S2','jardines-carabayllo','B',8,'S2','sur','avenida',204300,'vendido'),
('P08-S1','jardines-carabayllo','A',8,'S1','sur','avenida',171300,'disponible'),
('P08-W','jardines-carabayllo','C',8,'W','oeste','cerros',136800,'disponible'),
('P09-N1','jardines-carabayllo','A',9,'N1','norte','parque',178200,'disponible'),
('P09-N2','jardines-carabayllo','B',9,'N2','norte','parque',211200,'disponible'),
('P09-N3','jardines-carabayllo','A',9,'N3','norte','parque',178200,'disponible'),
('P09-E','jardines-carabayllo','C',9,'E','este','ciudad',138700,'separado'),
('P09-S3','jardines-carabayllo','A',9,'S3','sur','avenida',172200,'disponible'),
('P09-S2','jardines-carabayllo','B',9,'S2','sur','avenida',205200,'disponible'),
('P09-S1','jardines-carabayllo','A',9,'S1','sur','avenida',172200,'disponible'),
('P09-W','jardines-carabayllo','C',9,'W','oeste','cerros',137700,'vendido'),
('P10-N1','jardines-carabayllo','A',10,'N1','norte','parque',179100,'disponible'),
('P10-N2','jardines-carabayllo','B',10,'N2','norte','parque',212100,'disponible'),
('P10-N3','jardines-carabayllo','A',10,'N3','norte','parque',179100,'vendido'),
('P10-E','jardines-carabayllo','C',10,'E','este','ciudad',139600,'separado'),
('P10-S3','jardines-carabayllo','A',10,'S3','sur','avenida',173100,'disponible'),
('P10-S2','jardines-carabayllo','B',10,'S2','sur','avenida',206100,'disponible'),
('P10-S1','jardines-carabayllo','A',10,'S1','sur','avenida',173100,'vendido'),
('P10-W','jardines-carabayllo','C',10,'W','oeste','cerros',138600,'separado'),
('P11-N1','jardines-carabayllo','A',11,'N1','norte','parque',180000,'disponible'),
('P11-N2','jardines-carabayllo','B',11,'N2','norte','parque',213000,'disponible'),
('P11-N3','jardines-carabayllo','A',11,'N3','norte','parque',180000,'vendido'),
('P11-E','jardines-carabayllo','C',11,'E','este','ciudad',140500,'disponible'),
('P11-S3','jardines-carabayllo','A',11,'S3','sur','avenida',174000,'disponible'),
('P11-S2','jardines-carabayllo','B',11,'S2','sur','avenida',207000,'disponible'),
('P11-S1','jardines-carabayllo','A',11,'S1','sur','avenida',174000,'disponible'),
('P11-W','jardines-carabayllo','C',11,'W','oeste','cerros',139500,'disponible'),
('P12-N1','jardines-carabayllo','A',12,'N1','norte','parque',180900,'separado'),
('P12-N2','jardines-carabayllo','B',12,'N2','norte','parque',213900,'vendido'),
('P12-N3','jardines-carabayllo','A',12,'N3','norte','parque',180900,'disponible'),
('P12-E','jardines-carabayllo','C',12,'E','este','ciudad',141400,'bloqueado'),
('P12-S3','jardines-carabayllo','A',12,'S3','sur','avenida',174900,'disponible'),
('P12-S2','jardines-carabayllo','B',12,'S2','sur','avenida',207900,'disponible'),
('P12-S1','jardines-carabayllo','A',12,'S1','sur','avenida',174900,'disponible'),
('P12-W','jardines-carabayllo','C',12,'W','oeste','cerros',140400,'bloqueado');
insert into sesiones (id,created_at,device) values ('10000000-0000-4000-8000-000000000001', now() - interval '1180 minutes', 'mobile');
insert into leads (id,sesion_id,nombre,telefono,ingreso_familiar,ahorro,tiene_vivienda,num_familia,distrito,consentimiento,precalificacion,score,score_detalle,etapa,unidad_interes_id,created_at,updated_at) values ('00000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','Rosa Huamán','51991000000',4600,24000,false,2,'Comas',true,'{"veredicto":"media","programas":[{"id":"techo_propio","nombre":"Techo Propio (Bono Familiar Habitacional)","elegible":false,"bono_estimado":0,"motivos":["Ingreso familiar por encima del tope del programa."]},{"id":"mivivienda","nombre":"Nuevo Crédito Mivivienda + Bono del Buen Pagador","elegible":true,"bono_estimado":25700,"motivos":["Cumple ingreso y no tiene vivienda propia."]}],"bono_recomendado":25700,"referencial":true}'::jsonb,50,'[{"regla":"precalificacion_media","puntos":15,"motivo":"Precalificación media: ahorro insuficiente"},{"regla":"simulo_y_alcanza","puntos":15,"motivo":"Simuló cuota de P08-W y le alcanza"},{"regla":"vio_3_unidades","puntos":5,"motivo":"Vio 3 o más unidades"},{"regla":"vio_vista","puntos":5,"motivo":"Miró la vista desde la ventana"},{"regla":"favorito","puntos":5,"motivo":"Guardó favoritos"},{"regla":"telefono_valido","puntos":5,"motivo":"Dejó teléfono válido"}]'::jsonb,'contactar','P08-W', now() - interval '1180 minutes', now() - interval '1150 minutes');
update sesiones set lead_id='00000000-0000-4000-8000-000000000001' where id='10000000-0000-4000-8000-000000000001';
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','ver_edificio',null,'{}',now() - interval '1200 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','ver_unidad','P08-W','{}',now() - interval '1197 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','ver_unidad','P11-W','{}',now() - interval '1194 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','ver_unidad','P05-S2','{}',now() - interval '1191 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','ver_unidad','P03-S1','{}',now() - interval '1188 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','precalificar','P08-W','{"veredicto":"media"}'::jsonb,now() - interval '1186 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','simular_cuota','P08-W','{"alcanza":true,"plazo":20,"inicial_pct":0.1,"cuota":1096,"ingreso":4600}'::jsonb,now() - interval '1184 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','ver_vista','P08-W','{}',now() - interval '1182 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','favorito','P08-W','{}',now() - interval '1180 minutes');
insert into seguimientos (lead_id,canal,plantilla,mensaje,programado_para,estado) values ('00000000-0000-4000-8000-000000000001','whatsapp','recordatorio_24h','Hola Rosa, soy Carla de Los Jardines de Carabayllo. Vi que te interesó el depa P08-W (tipología C, piso 8). ¿Te ayudo con la simulación de tu cuota o coordinamos una visita a la caseta?', now() + interval '180 minutes', 'pendiente');
insert into sesiones (id,created_at,device) values ('10000000-0000-4000-8000-000000000002', now() - interval '4772 minutes', 'mobile');
insert into leads (id,sesion_id,nombre,telefono,ingreso_familiar,ahorro,tiene_vivienda,num_familia,distrito,consentimiento,precalificacion,score,score_detalle,etapa,unidad_interes_id,created_at,updated_at) values ('00000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','Luis Ccahuana','51991012345',3900,18000,false,2,'Los Olivos',true,'{"veredicto":"alta","programas":[{"id":"techo_propio","nombre":"Techo Propio (Bono Familiar Habitacional)","elegible":false,"bono_estimado":0,"motivos":["Ingreso familiar por encima del tope del programa."]},{"id":"mivivienda","nombre":"Nuevo Crédito Mivivienda + Bono del Buen Pagador","elegible":true,"bono_estimado":25700,"motivos":["Cumple ingreso y no tiene vivienda propia."]}],"bono_recomendado":25700,"referencial":true}'::jsonb,65,'[{"regla":"precalificacion_alta","puntos":30,"motivo":"Precalifica a Mivivienda + BBP"},{"regla":"simulo_y_alcanza","puntos":15,"motivo":"Simuló cuota de P03-S2 y le alcanza"},{"regla":"vio_3_unidades","puntos":5,"motivo":"Vio 3 o más unidades"},{"regla":"revisita","puntos":10,"motivo":"Volvió a entrar otro día"},{"regla":"telefono_valido","puntos":5,"motivo":"Dejó teléfono válido"}]'::jsonb,'contactar','P03-S2', now() - interval '4772 minutes', now() - interval '4742 minutes');
update sesiones set lead_id='00000000-0000-4000-8000-000000000002' where id='10000000-0000-4000-8000-000000000002';
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000002','ver_edificio',null,'{}',now() - interval '4792 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000002','ver_unidad','P03-S2','{}',now() - interval '4789 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000002','ver_unidad','P08-W','{}',now() - interval '4786 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000002','ver_unidad','P03-S1','{}',now() - interval '4783 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000002','ver_unidad','P10-S3','{}',now() - interval '4780 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000002','precalificar','P03-S2','{"veredicto":"alta"}'::jsonb,now() - interval '4778 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000002','simular_cuota','P03-S2','{"alcanza":true,"plazo":20,"inicial_pct":0.1,"cuota":1600,"ingreso":3900}'::jsonb,now() - interval '4776 minutes');
insert into seguimientos (lead_id,canal,plantilla,mensaje,programado_para,estado) values ('00000000-0000-4000-8000-000000000002','whatsapp','recordatorio_24h','Hola Luis, soy Carla de Los Jardines de Carabayllo. Vi que te interesó el depa P03-S2 (tipología B, piso 3). ¿Te ayudo con la simulación de tu cuota o coordinamos una visita a la caseta?', now() + interval '22 minutes', 'pendiente');
insert into sesiones (id,created_at,device) values ('10000000-0000-4000-8000-000000000003', now() - interval '1883 minutes', 'mobile');
insert into leads (id,sesion_id,nombre,telefono,ingreso_familiar,ahorro,tiene_vivienda,num_familia,distrito,consentimiento,precalificacion,score,score_detalle,etapa,unidad_interes_id,created_at,updated_at) values ('00000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000003','María Quispe','51991024690',3200,19000,false,2,'Independencia',true,'{"veredicto":"media","programas":[{"id":"techo_propio","nombre":"Techo Propio (Bono Familiar Habitacional)","elegible":false,"bono_estimado":0,"motivos":["Ingreso familiar dentro del tope del programa."]},{"id":"mivivienda","nombre":"Nuevo Crédito Mivivienda + Bono del Buen Pagador","elegible":true,"bono_estimado":25700,"motivos":["Cumple ingreso y no tiene vivienda propia."]}],"bono_recomendado":25700,"referencial":true}'::jsonb,55,'[{"regla":"precalificacion_media","puntos":15,"motivo":"Precalificación media: ahorro insuficiente"},{"regla":"simulo_y_alcanza","puntos":15,"motivo":"Simuló cuota de P11-S3 y le alcanza"},{"regla":"vio_3_unidades","puntos":5,"motivo":"Vio 3 o más unidades"},{"regla":"vio_interior","puntos":5,"motivo":"Recorrió el interior"},{"regla":"revisita","puntos":10,"motivo":"Volvió a entrar otro día"},{"regla":"telefono_valido","puntos":5,"motivo":"Dejó teléfono válido"}]'::jsonb,'contactar','P11-S3', now() - interval '1883 minutes', now() - interval '1853 minutes');
update sesiones set lead_id='00000000-0000-4000-8000-000000000003' where id='10000000-0000-4000-8000-000000000003';
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000003','00000000-0000-4000-8000-000000000003','ver_edificio',null,'{}',now() - interval '1903 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000003','00000000-0000-4000-8000-000000000003','ver_unidad','P11-S3','{}',now() - interval '1900 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000003','00000000-0000-4000-8000-000000000003','ver_unidad','P01-E','{}',now() - interval '1897 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000003','00000000-0000-4000-8000-000000000003','ver_unidad','P08-E','{}',now() - interval '1894 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000003','00000000-0000-4000-8000-000000000003','ver_unidad','P11-W','{}',now() - interval '1891 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000003','00000000-0000-4000-8000-000000000003','precalificar','P11-S3','{"veredicto":"media"}'::jsonb,now() - interval '1889 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000003','00000000-0000-4000-8000-000000000003','simular_cuota','P11-S3','{"alcanza":true,"plazo":20,"inicial_pct":0.1,"cuota":1394,"ingreso":3200}'::jsonb,now() - interval '1887 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000003','00000000-0000-4000-8000-000000000003','ver_interior','P11-S3','{}',now() - interval '1885 minutes');
insert into seguimientos (lead_id,canal,plantilla,mensaje,programado_para,estado) values ('00000000-0000-4000-8000-000000000003','whatsapp','recordatorio_24h','Hola María, soy Carla de Los Jardines de Carabayllo. Vi que te interesó el depa P11-S3 (tipología A, piso 11). ¿Te ayudo con la simulación de tu cuota o coordinamos una visita a la caseta?', now() + interval '34 minutes', 'pendiente');
insert into sesiones (id,created_at,device) values ('10000000-0000-4000-8000-000000000004', now() - interval '6914 minutes', 'mobile');
insert into leads (id,sesion_id,nombre,telefono,ingreso_familiar,ahorro,tiene_vivienda,num_familia,distrito,consentimiento,precalificacion,score,score_detalle,etapa,unidad_interes_id,created_at,updated_at) values ('00000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000004','Jorge Mamani','51991037035',4400,6500,false,2,'Los Olivos',true,'{"veredicto":"media","programas":[{"id":"techo_propio","nombre":"Techo Propio (Bono Familiar Habitacional)","elegible":false,"bono_estimado":0,"motivos":["Ingreso familiar por encima del tope del programa."]},{"id":"mivivienda","nombre":"Nuevo Crédito Mivivienda + Bono del Buen Pagador","elegible":true,"bono_estimado":25700,"motivos":["Cumple ingreso y no tiene vivienda propia."]}],"bono_recomendado":25700,"referencial":true}'::jsonb,50,'[{"regla":"precalificacion_media","puntos":15,"motivo":"Precalificación media: ahorro insuficiente"},{"regla":"simulo_y_alcanza","puntos":15,"motivo":"Simuló cuota de P05-N1 y le alcanza"},{"regla":"vio_3_unidades","puntos":5,"motivo":"Vio 3 o más unidades"},{"regla":"vio_interior","puntos":5,"motivo":"Recorrió el interior"},{"regla":"vio_vista","puntos":5,"motivo":"Miró la vista desde la ventana"},{"regla":"telefono_valido","puntos":5,"motivo":"Dejó teléfono válido"}]'::jsonb,'contactar','P05-N1', now() - interval '6914 minutes', now() - interval '6884 minutes');
update sesiones set lead_id='00000000-0000-4000-8000-000000000004' where id='10000000-0000-4000-8000-000000000004';
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000004','00000000-0000-4000-8000-000000000004','ver_edificio',null,'{}',now() - interval '6934 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000004','00000000-0000-4000-8000-000000000004','ver_unidad','P05-N1','{}',now() - interval '6931 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000004','00000000-0000-4000-8000-000000000004','ver_unidad','P10-N2','{}',now() - interval '6928 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000004','00000000-0000-4000-8000-000000000004','ver_unidad','P12-S3','{}',now() - interval '6925 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000004','00000000-0000-4000-8000-000000000004','ver_unidad','P05-W','{}',now() - interval '6922 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000004','00000000-0000-4000-8000-000000000004','precalificar','P05-N1','{"veredicto":"media"}'::jsonb,now() - interval '6920 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000004','00000000-0000-4000-8000-000000000004','simular_cuota','P05-N1','{"alcanza":true,"plazo":20,"inicial_pct":0.1,"cuota":1399,"ingreso":4400}'::jsonb,now() - interval '6918 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000004','00000000-0000-4000-8000-000000000004','ver_interior','P05-N1','{}',now() - interval '6916 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000004','00000000-0000-4000-8000-000000000004','ver_vista','P05-N1','{}',now() - interval '6914 minutes');
insert into seguimientos (lead_id,canal,plantilla,mensaje,programado_para,estado) values ('00000000-0000-4000-8000-000000000004','whatsapp','recordatorio_24h','Hola Jorge, soy Carla de Los Jardines de Carabayllo. Vi que te interesó el depa P05-N1 (tipología A, piso 5). ¿Te ayudo con la simulación de tu cuota o coordinamos una visita a la caseta?', now() + interval '461 minutes', 'pendiente');
insert into sesiones (id,created_at,device) values ('10000000-0000-4000-8000-000000000005', now() - interval '415 minutes', 'mobile');
insert into leads (id,sesion_id,nombre,telefono,ingreso_familiar,ahorro,tiene_vivienda,num_familia,distrito,consentimiento,precalificacion,score,score_detalle,etapa,unidad_interes_id,created_at,updated_at) values ('00000000-0000-4000-8000-000000000005','10000000-0000-4000-8000-000000000005','Ana Torres','51991049380',5600,6500,false,2,'Comas',true,'{"veredicto":"alta","programas":[{"id":"techo_propio","nombre":"Techo Propio (Bono Familiar Habitacional)","elegible":false,"bono_estimado":0,"motivos":["Ingreso familiar por encima del tope del programa."]},{"id":"mivivienda","nombre":"Nuevo Crédito Mivivienda + Bono del Buen Pagador","elegible":true,"bono_estimado":25700,"motivos":["Cumple ingreso y no tiene vivienda propia."]}],"bono_recomendado":25700,"referencial":true}'::jsonb,75,'[{"regla":"precalificacion_alta","puntos":30,"motivo":"Precalifica a Mivivienda + BBP"},{"regla":"simulo_y_alcanza","puntos":15,"motivo":"Simuló cuota de P11-S3 y le alcanza"},{"regla":"vio_3_unidades","puntos":5,"motivo":"Vio 3 o más unidades"},{"regla":"vio_interior","puntos":5,"motivo":"Recorrió el interior"},{"regla":"vio_vista","puntos":5,"motivo":"Miró la vista desde la ventana"},{"regla":"revisita","puntos":10,"motivo":"Volvió a entrar otro día"},{"regla":"telefono_valido","puntos":5,"motivo":"Dejó teléfono válido"}]'::jsonb,'calificado','P11-S3', now() - interval '415 minutes', now() - interval '385 minutes');
update sesiones set lead_id='00000000-0000-4000-8000-000000000005' where id='10000000-0000-4000-8000-000000000005';
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000005','00000000-0000-4000-8000-000000000005','ver_edificio',null,'{}',now() - interval '435 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000005','00000000-0000-4000-8000-000000000005','ver_unidad','P11-S3','{}',now() - interval '432 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000005','00000000-0000-4000-8000-000000000005','ver_unidad','P12-S3','{}',now() - interval '429 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000005','00000000-0000-4000-8000-000000000005','ver_unidad','P07-S1','{}',now() - interval '426 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000005','00000000-0000-4000-8000-000000000005','ver_unidad','P12-S3','{}',now() - interval '423 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000005','00000000-0000-4000-8000-000000000005','precalificar','P11-S3','{"veredicto":"alta"}'::jsonb,now() - interval '421 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000005','00000000-0000-4000-8000-000000000005','simular_cuota','P11-S3','{"alcanza":true,"plazo":20,"inicial_pct":0.1,"cuota":1394,"ingreso":5600}'::jsonb,now() - interval '419 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000005','00000000-0000-4000-8000-000000000005','ver_interior','P11-S3','{}',now() - interval '417 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000005','00000000-0000-4000-8000-000000000005','ver_vista','P11-S3','{}',now() - interval '415 minutes');
insert into citas (lead_id,unidad_id,tipo,fecha,estado) values ('00000000-0000-4000-8000-000000000005','P11-S3','visita', now() + interval '3 days', 'programada');
insert into sesiones (id,created_at,device) values ('10000000-0000-4000-8000-000000000006', now() - interval '5894 minutes', 'mobile');
insert into leads (id,sesion_id,nombre,telefono,ingreso_familiar,ahorro,tiene_vivienda,num_familia,distrito,consentimiento,precalificacion,score,score_detalle,etapa,unidad_interes_id,created_at,updated_at) values ('00000000-0000-4000-8000-000000000006','10000000-0000-4000-8000-000000000006','Pedro Chávez','51991061725',3500,9500,false,4,'Los Olivos',true,'{"veredicto":"alta","programas":[{"id":"techo_propio","nombre":"Techo Propio (Bono Familiar Habitacional)","elegible":true,"bono_estimado":44100,"motivos":["Ingreso familiar dentro del tope del programa."]},{"id":"mivivienda","nombre":"Nuevo Crédito Mivivienda + Bono del Buen Pagador","elegible":true,"bono_estimado":25700,"motivos":["Cumple ingreso y no tiene vivienda propia."]}],"bono_recomendado":44100,"referencial":true}'::jsonb,45,'[{"regla":"precalificacion_alta","puntos":30,"motivo":"Precalifica a Mivivienda + BBP"},{"regla":"vio_3_unidades","puntos":5,"motivo":"Vio 3 o más unidades"},{"regla":"vio_interior","puntos":5,"motivo":"Recorrió el interior"},{"regla":"telefono_valido","puntos":5,"motivo":"Dejó teléfono válido"}]'::jsonb,'contactar','P12-S3', now() - interval '5894 minutes', now() - interval '5864 minutes');
update sesiones set lead_id='00000000-0000-4000-8000-000000000006' where id='10000000-0000-4000-8000-000000000006';
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000006','00000000-0000-4000-8000-000000000006','ver_edificio',null,'{}',now() - interval '5914 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000006','00000000-0000-4000-8000-000000000006','ver_unidad','P12-S3','{}',now() - interval '5911 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000006','00000000-0000-4000-8000-000000000006','ver_unidad','P03-S2','{}',now() - interval '5908 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000006','00000000-0000-4000-8000-000000000006','ver_unidad','P08-W','{}',now() - interval '5905 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000006','00000000-0000-4000-8000-000000000006','ver_unidad','P12-S2','{}',now() - interval '5902 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000006','00000000-0000-4000-8000-000000000006','precalificar','P12-S3','{"veredicto":"alta"}'::jsonb,now() - interval '5900 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000006','00000000-0000-4000-8000-000000000006','ver_interior','P12-S3','{}',now() - interval '5898 minutes');
insert into seguimientos (lead_id,canal,plantilla,mensaje,programado_para,estado) values ('00000000-0000-4000-8000-000000000006','whatsapp','recordatorio_24h','Hola Pedro, soy Carla de Los Jardines de Carabayllo. Vi que te interesó el depa P12-S3 (tipología A, piso 12). ¿Te ayudo con la simulación de tu cuota o coordinamos una visita a la caseta?', now() + interval '305 minutes', 'pendiente');
insert into sesiones (id,created_at,device) values ('10000000-0000-4000-8000-000000000007', now() - interval '3418 minutes', 'mobile');
insert into leads (id,sesion_id,nombre,telefono,ingreso_familiar,ahorro,tiene_vivienda,num_familia,distrito,consentimiento,precalificacion,score,score_detalle,etapa,unidad_interes_id,created_at,updated_at) values ('00000000-0000-4000-8000-000000000007','10000000-0000-4000-8000-000000000007','Carmen Flores','51991074070',5100,20000,false,4,'Independencia',true,'{"veredicto":"media","programas":[{"id":"techo_propio","nombre":"Techo Propio (Bono Familiar Habitacional)","elegible":false,"bono_estimado":0,"motivos":["Ingreso familiar por encima del tope del programa."]},{"id":"mivivienda","nombre":"Nuevo Crédito Mivivienda + Bono del Buen Pagador","elegible":true,"bono_estimado":25700,"motivos":["Cumple ingreso y no tiene vivienda propia."]}],"bono_recomendado":25700,"referencial":true}'::jsonb,45,'[{"regla":"precalificacion_media","puntos":15,"motivo":"Precalificación media: ahorro insuficiente"},{"regla":"simulo_y_alcanza","puntos":15,"motivo":"Simuló cuota de P10-N1 y le alcanza"},{"regla":"vio_3_unidades","puntos":5,"motivo":"Vio 3 o más unidades"},{"regla":"vio_vista","puntos":5,"motivo":"Miró la vista desde la ventana"},{"regla":"telefono_valido","puntos":5,"motivo":"Dejó teléfono válido"}]'::jsonb,'contactar','P10-N1', now() - interval '3418 minutes', now() - interval '3388 minutes');
update sesiones set lead_id='00000000-0000-4000-8000-000000000007' where id='10000000-0000-4000-8000-000000000007';
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000007','00000000-0000-4000-8000-000000000007','ver_edificio',null,'{}',now() - interval '3438 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000007','00000000-0000-4000-8000-000000000007','ver_unidad','P10-N1','{}',now() - interval '3435 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000007','00000000-0000-4000-8000-000000000007','ver_unidad','P05-W','{}',now() - interval '3432 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000007','00000000-0000-4000-8000-000000000007','ver_unidad','P09-S1','{}',now() - interval '3429 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000007','00000000-0000-4000-8000-000000000007','ver_unidad','P05-S1','{}',now() - interval '3426 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000007','00000000-0000-4000-8000-000000000007','precalificar','P10-N1','{"veredicto":"media"}'::jsonb,now() - interval '3424 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000007','00000000-0000-4000-8000-000000000007','simular_cuota','P10-N1','{"alcanza":true,"plazo":20,"inicial_pct":0.1,"cuota":1435,"ingreso":5100}'::jsonb,now() - interval '3422 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000007','00000000-0000-4000-8000-000000000007','ver_vista','P10-N1','{}',now() - interval '3420 minutes');
insert into seguimientos (lead_id,canal,plantilla,mensaje,programado_para,estado) values ('00000000-0000-4000-8000-000000000007','whatsapp','recordatorio_24h','Hola Carmen, soy Carla de Los Jardines de Carabayllo. Vi que te interesó el depa P10-N1 (tipología A, piso 10). ¿Te ayudo con la simulación de tu cuota o coordinamos una visita a la caseta?', now() + interval '53 minutes', 'pendiente');
insert into sesiones (id,created_at,device) values ('10000000-0000-4000-8000-000000000008', now() - interval '1313 minutes', 'mobile');
insert into leads (id,sesion_id,nombre,telefono,ingreso_familiar,ahorro,tiene_vivienda,num_familia,distrito,consentimiento,precalificacion,score,score_detalle,etapa,unidad_interes_id,created_at,updated_at) values ('00000000-0000-4000-8000-000000000008','10000000-0000-4000-8000-000000000008','Víctor Rojas','51991086415',4100,24500,false,4,'Puente Piedra',true,'{"veredicto":"alta","programas":[{"id":"techo_propio","nombre":"Techo Propio (Bono Familiar Habitacional)","elegible":false,"bono_estimado":0,"motivos":["Ingreso familiar por encima del tope del programa."]},{"id":"mivivienda","nombre":"Nuevo Crédito Mivivienda + Bono del Buen Pagador","elegible":true,"bono_estimado":25700,"motivos":["Cumple ingreso y no tiene vivienda propia."]}],"bono_recomendado":25700,"referencial":true}'::jsonb,75,'[{"regla":"precalificacion_alta","puntos":30,"motivo":"Precalifica a Mivivienda + BBP"},{"regla":"simulo_y_alcanza","puntos":15,"motivo":"Simuló cuota de P04-N1 y le alcanza"},{"regla":"vio_3_unidades","puntos":5,"motivo":"Vio 3 o más unidades"},{"regla":"vio_interior","puntos":5,"motivo":"Recorrió el interior"},{"regla":"vio_vista","puntos":5,"motivo":"Miró la vista desde la ventana"},{"regla":"revisita","puntos":10,"motivo":"Volvió a entrar otro día"},{"regla":"telefono_valido","puntos":5,"motivo":"Dejó teléfono válido"}]'::jsonb,'calificado','P04-N1', now() - interval '1313 minutes', now() - interval '1283 minutes');
update sesiones set lead_id='00000000-0000-4000-8000-000000000008' where id='10000000-0000-4000-8000-000000000008';
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000008','00000000-0000-4000-8000-000000000008','ver_edificio',null,'{}',now() - interval '1333 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000008','00000000-0000-4000-8000-000000000008','ver_unidad','P04-N1','{}',now() - interval '1330 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000008','00000000-0000-4000-8000-000000000008','ver_unidad','P06-N3','{}',now() - interval '1327 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000008','00000000-0000-4000-8000-000000000008','ver_unidad','P03-S2','{}',now() - interval '1324 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000008','00000000-0000-4000-8000-000000000008','ver_unidad','P03-S1','{}',now() - interval '1321 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000008','00000000-0000-4000-8000-000000000008','precalificar','P04-N1','{"veredicto":"alta"}'::jsonb,now() - interval '1319 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000008','00000000-0000-4000-8000-000000000008','simular_cuota','P04-N1','{"alcanza":true,"plazo":20,"inicial_pct":0.1,"cuota":1391,"ingreso":4100}'::jsonb,now() - interval '1317 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000008','00000000-0000-4000-8000-000000000008','ver_interior','P04-N1','{}',now() - interval '1315 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000008','00000000-0000-4000-8000-000000000008','ver_vista','P04-N1','{}',now() - interval '1313 minutes');
insert into sesiones (id,created_at,device) values ('10000000-0000-4000-8000-000000000009', now() - interval '5996 minutes', 'mobile');
insert into leads (id,sesion_id,nombre,telefono,ingreso_familiar,ahorro,tiene_vivienda,num_familia,distrito,consentimiento,precalificacion,score,score_detalle,etapa,unidad_interes_id,created_at,updated_at) values ('00000000-0000-4000-8000-000000000009','10000000-0000-4000-8000-000000000009','Lucía Paredes','51991098760',3000,6500,false,2,'Los Olivos',true,'{"veredicto":"alta","programas":[{"id":"techo_propio","nombre":"Techo Propio (Bono Familiar Habitacional)","elegible":true,"bono_estimado":44100,"motivos":["Ingreso familiar dentro del tope del programa."]},{"id":"mivivienda","nombre":"Nuevo Crédito Mivivienda + Bono del Buen Pagador","elegible":true,"bono_estimado":25700,"motivos":["Cumple ingreso y no tiene vivienda propia."]}],"bono_recomendado":44100,"referencial":true}'::jsonb,70,'[{"regla":"precalificacion_alta","puntos":30,"motivo":"Precalifica a Mivivienda + BBP"},{"regla":"simulo_y_alcanza","puntos":15,"motivo":"Simuló cuota de P12-N3 y le alcanza"},{"regla":"vio_3_unidades","puntos":5,"motivo":"Vio 3 o más unidades"},{"regla":"vio_vista","puntos":5,"motivo":"Miró la vista desde la ventana"},{"regla":"revisita","puntos":10,"motivo":"Volvió a entrar otro día"},{"regla":"telefono_valido","puntos":5,"motivo":"Dejó teléfono válido"}]'::jsonb,'calificado','P12-N3', now() - interval '5996 minutes', now() - interval '5966 minutes');
update sesiones set lead_id='00000000-0000-4000-8000-000000000009' where id='10000000-0000-4000-8000-000000000009';
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000009','00000000-0000-4000-8000-000000000009','ver_edificio',null,'{}',now() - interval '6016 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000009','00000000-0000-4000-8000-000000000009','ver_unidad','P12-N3','{}',now() - interval '6013 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000009','00000000-0000-4000-8000-000000000009','ver_unidad','P11-S1','{}',now() - interval '6010 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000009','00000000-0000-4000-8000-000000000009','ver_unidad','P07-N2','{}',now() - interval '6007 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000009','00000000-0000-4000-8000-000000000009','ver_unidad','P10-S3','{}',now() - interval '6004 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000009','00000000-0000-4000-8000-000000000009','precalificar','P12-N3','{"veredicto":"alta"}'::jsonb,now() - interval '6002 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000009','00000000-0000-4000-8000-000000000009','simular_cuota','P12-N3','{"alcanza":true,"plazo":20,"inicial_pct":0.1,"cuota":1449,"ingreso":3000}'::jsonb,now() - interval '6000 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000009','00000000-0000-4000-8000-000000000009','ver_vista','P12-N3','{}',now() - interval '5998 minutes');
insert into citas (lead_id,unidad_id,tipo,fecha,estado) values ('00000000-0000-4000-8000-000000000009','P12-N3','visita', now() + interval '2 days', 'programada');
insert into sesiones (id,created_at,device) values ('10000000-0000-4000-8000-000000000010', now() - interval '3224 minutes', 'mobile');
insert into leads (id,sesion_id,nombre,telefono,ingreso_familiar,ahorro,tiene_vivienda,num_familia,distrito,consentimiento,precalificacion,score,score_detalle,etapa,unidad_interes_id,created_at,updated_at) values ('00000000-0000-4000-8000-000000000010','10000000-0000-4000-8000-000000000010','Miguel Sánchez','51991111105',5000,19000,false,5,'Comas',true,'{"veredicto":"baja","programas":[{"id":"techo_propio","nombre":"Techo Propio (Bono Familiar Habitacional)","elegible":false,"bono_estimado":0,"motivos":["Ingreso familiar por encima del tope del programa."]},{"id":"mivivienda","nombre":"Nuevo Crédito Mivivienda + Bono del Buen Pagador","elegible":false,"bono_estimado":0,"motivos":["El ahorro declarado no cubre la cuota inicial mínima."]}],"bono_recomendado":0,"referencial":true}'::jsonb,40,'[{"regla":"simulo_y_alcanza","puntos":15,"motivo":"Simuló cuota de P09-S3 y le alcanza"},{"regla":"vio_3_unidades","puntos":5,"motivo":"Vio 3 o más unidades"},{"regla":"vio_interior","puntos":5,"motivo":"Recorrió el interior"},{"regla":"vio_vista","puntos":5,"motivo":"Miró la vista desde la ventana"},{"regla":"favorito","puntos":5,"motivo":"Guardó favoritos"},{"regla":"telefono_valido","puntos":5,"motivo":"Dejó teléfono válido"}]'::jsonb,'contactar','P09-S3', now() - interval '3224 minutes', now() - interval '3194 minutes');
update sesiones set lead_id='00000000-0000-4000-8000-000000000010' where id='10000000-0000-4000-8000-000000000010';
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000010','00000000-0000-4000-8000-000000000010','ver_edificio',null,'{}',now() - interval '3244 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000010','00000000-0000-4000-8000-000000000010','ver_unidad','P09-S3','{}',now() - interval '3241 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000010','00000000-0000-4000-8000-000000000010','ver_unidad','P09-N2','{}',now() - interval '3238 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000010','00000000-0000-4000-8000-000000000010','ver_unidad','P03-S3','{}',now() - interval '3235 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000010','00000000-0000-4000-8000-000000000010','ver_unidad','P06-N3','{}',now() - interval '3232 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000010','00000000-0000-4000-8000-000000000010','simular_cuota','P09-S3','{"alcanza":true,"plazo":20,"inicial_pct":0.1,"cuota":1379,"ingreso":5000}'::jsonb,now() - interval '3230 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000010','00000000-0000-4000-8000-000000000010','ver_interior','P09-S3','{}',now() - interval '3228 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000010','00000000-0000-4000-8000-000000000010','ver_vista','P09-S3','{}',now() - interval '3226 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000010','00000000-0000-4000-8000-000000000010','favorito','P09-S3','{}',now() - interval '3224 minutes');
insert into seguimientos (lead_id,canal,plantilla,mensaje,programado_para,estado) values ('00000000-0000-4000-8000-000000000010','whatsapp','recordatorio_24h','Hola Miguel, soy Carla de Los Jardines de Carabayllo. Vi que te interesó el depa P09-S3 (tipología A, piso 9). ¿Te ayudo con la simulación de tu cuota o coordinamos una visita a la caseta?', now() + interval '25 minutes', 'pendiente');
update leads set etapa='separado', unidad_interes_id='P03-N2', score=least(100, score+20), score_detalle = score_detalle || '[{"regla":"separo","puntos":20,"motivo":"Separó P03-N2"}]'::jsonb where id='00000000-0000-4000-8000-000000000009';
update unidades set lead_separacion_id='00000000-0000-4000-8000-000000000009' where id='P03-N2';
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000009','00000000-0000-4000-8000-000000000009','iniciar_separacion','P03-N2','{}',now() - interval '5958 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000009','00000000-0000-4000-8000-000000000009','separar','P03-N2','{}',now() - interval '5956 minutes');
delete from seguimientos where lead_id='00000000-0000-4000-8000-000000000009';
insert into seguimientos (lead_id,canal,plantilla,mensaje,programado_para,estado) values ('00000000-0000-4000-8000-000000000009','whatsapp','separacion_0','Hola Lucía, ¡felicitaciones por separar el depa P03-N2! Soy Carla, tu asesora. Te escribo para coordinar la firma de la separación y los documentos para el banco.', now() - interval '5951 minutes', 'enviado');
insert into seguimientos (lead_id,canal,plantilla,mensaje,programado_para,estado) values ('00000000-0000-4000-8000-000000000009','whatsapp','separacion_1','Hola Lucía, ¿pudiste reunir los documentos para la evaluación crediticia del depa P03-N2? Cualquier duda me avisas y lo vemos juntos.', now() + interval '258 minutes', 'pendiente');
update leads set etapa='separado', unidad_interes_id='P05-N3', score=least(100, score+20), score_detalle = score_detalle || '[{"regla":"separo","puntos":20,"motivo":"Separó P05-N3"}]'::jsonb where id='00000000-0000-4000-8000-000000000010';
update unidades set lead_separacion_id='00000000-0000-4000-8000-000000000010' where id='P05-N3';
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000010','00000000-0000-4000-8000-000000000010','iniciar_separacion','P05-N3','{}',now() - interval '3186 minutes');
insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values ('10000000-0000-4000-8000-000000000010','00000000-0000-4000-8000-000000000010','separar','P05-N3','{}',now() - interval '3184 minutes');
delete from seguimientos where lead_id='00000000-0000-4000-8000-000000000010';
insert into seguimientos (lead_id,canal,plantilla,mensaje,programado_para,estado) values ('00000000-0000-4000-8000-000000000010','whatsapp','separacion_0','Hola Miguel, ¡felicitaciones por separar el depa P05-N3! Soy Carla, tu asesora. Te escribo para coordinar la firma de la separación y los documentos para el banco.', now() - interval '3179 minutes', 'enviado');
insert into seguimientos (lead_id,canal,plantilla,mensaje,programado_para,estado) values ('00000000-0000-4000-8000-000000000010','whatsapp','separacion_1','Hola Miguel, ¿pudiste reunir los documentos para la evaluación crediticia del depa P05-N3? Cualquier duda me avisas y lo vemos juntos.', now() + interval '146 minutes', 'pendiente');
update leads set etapa='contactado' where id='00000000-0000-4000-8000-000000000004';
update seguimientos set estado='enviado' where lead_id='00000000-0000-4000-8000-000000000004';
insert into citas (lead_id,unidad_id,tipo,fecha,estado) values ('00000000-0000-4000-8000-000000000004','P05-N1','videollamada', now() + interval '2 days', 'programada');
insert into incidencias (lead_id,unidad_id,categoria,descripcion,estado,created_at) values ('00000000-0000-4000-8000-000000000002','P01-S3','filtracion','Aparece humedad en la pared del dormitorio principal cuando llueve. La mancha crece cada semana.','abierta',now() - interval '4320 minutes');
insert into incidencias (lead_id,unidad_id,categoria,descripcion,estado,created_at) values ('00000000-0000-4000-8000-000000000006','P02-S3','acabados','La puerta del baño no cierra bien y la cerámica de la cocina tiene dos piezas sueltas.','en_proceso',now() - interval '12960 minutes');
insert into incidencias (lead_id,unidad_id,categoria,descripcion,estado,created_at) values ('00000000-0000-4000-8000-000000000007','P04-N3','instalaciones','El tomacorriente de la sala no tiene energía desde la entrega.','resuelta',now() - interval '28800 minutes');
insert into consultas (sesion_id,pregunta,respuesta,fuente,created_at) values ('10000000-0000-4000-8000-000000000001','¿Cuánto es la cuota de un 2 dorm?','Un depa de 2 dorm desde S/ 165,000 tendría una cuota referencial de S/ 1,436 al mes (10% de inicial, 20 años, sin bono).','plantilla',now() - interval '1170 minutes');
insert into consultas (sesion_id,pregunta,respuesta,fuente,created_at) values ('10000000-0000-4000-8000-000000000002','¿Puedo usar Techo Propio?','Este proyecto podría calificar para Techo Propio y Nuevo Crédito Mivivienda, con bonos referenciales que dependen de tu ingreso, ahorro y si ya tienes vivienda.','plantilla',now() - interval '4761 minutes');
insert into consultas (sesion_id,pregunta,respuesta,fuente,created_at) values ('10000000-0000-4000-8000-000000000003','¿Cuándo entregan?','La entrega estimada del proyecto es 2027-12. Es una fecha referencial sujeta al avance de obra.','plantilla',now() - interval '1871 minutes');
insert into consultas (sesion_id,pregunta,respuesta,fuente,created_at) values ('10000000-0000-4000-8000-000000000004','¿Qué depas quedan con vista al parque?','Quedan departamentos disponibles con vista al parque (norte) desde S/ 173,700.','plantilla',now() - interval '6901 minutes');
insert into consultas (sesion_id,pregunta,respuesta,fuente,created_at) values ('10000000-0000-4000-8000-000000000005','¿Tiene estacionamiento?','La disponibilidad de estacionamientos varía según la unidad; pregúntale al asesor por el departamento que te interesa.','plantilla',now() - interval '401 minutes');
insert into consultas (sesion_id,pregunta,respuesta,fuente,created_at) values ('10000000-0000-4000-8000-000000000006','¿Aceptan pago con AFP?','No tengo esa información a la mano. Un asesor puede resolverte esa duda directamente.','plantilla',now() - interval '5879 minutes');
insert into sesiones (id,created_at,device) values ('20000000-0000-4000-8000-000000000001', now() - interval '4323 minutes', 'desktop');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000001','ver_unidad','P04-N2','{}',now() - interval '7 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000001','ver_unidad','P09-N2','{}',now() - interval '676 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000001','P09-N2') on conflict do nothing;
insert into sesiones (id,created_at,device) values ('20000000-0000-4000-8000-000000000002', now() - interval '5614 minutes', 'mobile');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000002','ver_unidad','P06-N2','{}',now() - interval '4951 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000002','P06-N2') on conflict do nothing;
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000002','ver_unidad','P01-N1','{}',now() - interval '7524 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000002','ver_unidad','P08-N2','{}',now() - interval '7561 minutes');
insert into sesiones (id,created_at,device) values ('20000000-0000-4000-8000-000000000003', now() - interval '6110 minutes', 'mobile');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000003','ver_unidad','P05-N2','{}',now() - interval '8135 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000003','ver_unidad','P06-S1','{}',now() - interval '2385 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000003','ver_unidad','P07-N1','{}',now() - interval '6670 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000003','ver_unidad','P09-N1','{}',now() - interval '2788 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000003','ver_unidad','P02-E','{}',now() - interval '380 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000003','ver_unidad','P07-N2','{}',now() - interval '8707 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000003','P07-N2') on conflict do nothing;
insert into sesiones (id,created_at,device) values ('20000000-0000-4000-8000-000000000004', now() - interval '6923 minutes', 'mobile');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000004','ver_unidad','P10-N2','{}',now() - interval '2168 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000004','P10-N2') on conflict do nothing;
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000004','ver_unidad','P02-S3','{}',now() - interval '2561 minutes');
insert into sesiones (id,created_at,device) values ('20000000-0000-4000-8000-000000000005', now() - interval '7649 minutes', 'mobile');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000005','ver_unidad','P06-N2','{}',now() - interval '5697 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000005','P06-N2') on conflict do nothing;
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000005','ver_unidad','P07-N3','{}',now() - interval '7403 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000005','ver_unidad','P07-N1','{}',now() - interval '7265 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000005','ver_unidad','P08-N1','{}',now() - interval '4014 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000005','ver_unidad','P04-N3','{}',now() - interval '3245 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000005','ver_unidad','P06-N3','{}',now() - interval '7302 minutes');
insert into sesiones (id,created_at,device) values ('20000000-0000-4000-8000-000000000006', now() - interval '8835 minutes', 'desktop');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000006','ver_unidad','P07-N1','{}',now() - interval '2620 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000006','ver_unidad','P11-S3','{}',now() - interval '8917 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000006','P11-S3') on conflict do nothing;
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000006','ver_unidad','P12-W','{}',now() - interval '3401 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000006','ver_unidad','P06-S3','{}',now() - interval '4793 minutes');
insert into sesiones (id,created_at,device) values ('20000000-0000-4000-8000-000000000007', now() - interval '3085 minutes', 'mobile');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000007','ver_unidad','P09-N2','{}',now() - interval '874 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000007','P09-N2') on conflict do nothing;
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000007','ver_unidad','P06-N1','{}',now() - interval '9351 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000007','P06-N1') on conflict do nothing;
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000007','ver_unidad','P09-N2','{}',now() - interval '825 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000007','ver_unidad','P06-N2','{}',now() - interval '1479 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000007','P06-N2') on conflict do nothing;
insert into sesiones (id,created_at,device) values ('20000000-0000-4000-8000-000000000008', now() - interval '9932 minutes', 'mobile');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000008','ver_unidad','P09-S1','{}',now() - interval '2153 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000008','ver_unidad','P08-N1','{}',now() - interval '4210 minutes');
insert into sesiones (id,created_at,device) values ('20000000-0000-4000-8000-000000000009', now() - interval '7882 minutes', 'mobile');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000009','ver_unidad','P09-N2','{}',now() - interval '644 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000009','ver_unidad','P07-N3','{}',now() - interval '5811 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000009','P07-N3') on conflict do nothing;
insert into sesiones (id,created_at,device) values ('20000000-0000-4000-8000-000000000010', now() - interval '7251 minutes', 'mobile');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000010','ver_unidad','P07-N2','{}',now() - interval '2909 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000010','P07-N2') on conflict do nothing;
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000010','ver_unidad','P11-N1','{}',now() - interval '3197 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000010','ver_unidad','P01-N2','{}',now() - interval '9658 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000010','ver_unidad','P06-N1','{}',now() - interval '8165 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000010','ver_unidad','P05-S1','{}',now() - interval '1916 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000010','P05-S1') on conflict do nothing;
insert into sesiones (id,created_at,device) values ('20000000-0000-4000-8000-000000000011', now() - interval '9327 minutes', 'mobile');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000011','ver_unidad','P12-N1','{}',now() - interval '1823 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000011','ver_unidad','P08-S3','{}',now() - interval '7961 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000011','ver_unidad','P09-N1','{}',now() - interval '1208 minutes');
insert into sesiones (id,created_at,device) values ('20000000-0000-4000-8000-000000000012', now() - interval '139 minutes', 'mobile');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000012','ver_unidad','P08-N1','{}',now() - interval '889 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000012','P08-N1') on conflict do nothing;
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000012','ver_unidad','P04-N1','{}',now() - interval '9523 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000012','ver_unidad','P02-S2','{}',now() - interval '1733 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000012','P02-S2') on conflict do nothing;
insert into sesiones (id,created_at,device) values ('20000000-0000-4000-8000-000000000013', now() - interval '4216 minutes', 'mobile');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000013','ver_unidad','P03-W','{}',now() - interval '9355 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000013','ver_unidad','P07-N3','{}',now() - interval '9738 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000013','P07-N3') on conflict do nothing;
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000013','ver_unidad','P07-N1','{}',now() - interval '4994 minutes');
insert into sesiones (id,created_at,device) values ('20000000-0000-4000-8000-000000000014', now() - interval '10036 minutes', 'mobile');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000014','ver_unidad','P03-W','{}',now() - interval '4149 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000014','P03-W') on conflict do nothing;
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000014','ver_unidad','P03-S1','{}',now() - interval '7264 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000014','ver_unidad','P08-N2','{}',now() - interval '7669 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000014','P08-N2') on conflict do nothing;
insert into sesiones (id,created_at,device) values ('20000000-0000-4000-8000-000000000015', now() - interval '2210 minutes', 'desktop');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000015','ver_unidad','P09-N2','{}',now() - interval '5610 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000015','P09-N2') on conflict do nothing;
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000015','ver_unidad','P09-N1','{}',now() - interval '7942 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000015','P09-N1') on conflict do nothing;
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000015','ver_unidad','P07-N1','{}',now() - interval '4588 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000015','ver_unidad','P08-N1','{}',now() - interval '3335 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000015','ver_unidad','P10-S3','{}',now() - interval '1970 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000015','ver_unidad','P09-S3','{}',now() - interval '567 minutes');
insert into sesiones (id,created_at,device) values ('20000000-0000-4000-8000-000000000016', now() - interval '1092 minutes', 'mobile');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000016','ver_unidad','P02-S2','{}',now() - interval '716 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000016','ver_unidad','P09-N2','{}',now() - interval '2186 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000016','ver_unidad','P06-N1','{}',now() - interval '4775 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000016','ver_unidad','P01-S3','{}',now() - interval '9925 minutes');
insert into sesiones (id,created_at,device) values ('20000000-0000-4000-8000-000000000017', now() - interval '2138 minutes', 'mobile');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000017','ver_unidad','P09-N1','{}',now() - interval '7038 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000017','P09-N1') on conflict do nothing;
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000017','ver_unidad','P06-N3','{}',now() - interval '1400 minutes');
insert into sesiones (id,created_at,device) values ('20000000-0000-4000-8000-000000000018', now() - interval '3595 minutes', 'mobile');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000018','ver_unidad','P08-N1','{}',now() - interval '2988 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000018','ver_unidad','P03-S3','{}',now() - interval '7601 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000018','P03-S3') on conflict do nothing;
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000018','ver_unidad','P09-N3','{}',now() - interval '5820 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000018','ver_unidad','P09-N1','{}',now() - interval '5601 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000018','P09-N1') on conflict do nothing;
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000018','ver_unidad','P12-E','{}',now() - interval '5334 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000018','P12-E') on conflict do nothing;
insert into sesiones (id,created_at,device) values ('20000000-0000-4000-8000-000000000019', now() - interval '3650 minutes', 'desktop');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000019','ver_unidad','P05-W','{}',now() - interval '9344 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000019','ver_unidad','P06-N3','{}',now() - interval '9071 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000019','ver_unidad','P04-S3','{}',now() - interval '506 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000019','ver_unidad','P09-S1','{}',now() - interval '4196 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000019','ver_unidad','P09-N1','{}',now() - interval '538 minutes');
insert into sesiones (id,created_at,device) values ('20000000-0000-4000-8000-000000000020', now() - interval '6673 minutes', 'mobile');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000020','ver_unidad','P08-N2','{}',now() - interval '9428 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000020','P08-N2') on conflict do nothing;
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000020','ver_unidad','P09-N3','{}',now() - interval '8152 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000020','ver_unidad','P08-S2','{}',now() - interval '7059 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000020','ver_unidad','P02-S1','{}',now() - interval '5312 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000020','ver_unidad','P09-N2','{}',now() - interval '9388 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000020','P09-N2') on conflict do nothing;
insert into sesiones (id,created_at,device) values ('20000000-0000-4000-8000-000000000021', now() - interval '7793 minutes', 'mobile');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000021','ver_unidad','P06-N3','{}',now() - interval '9398 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000021','P06-N3') on conflict do nothing;
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000021','ver_unidad','P07-N1','{}',now() - interval '3533 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000021','ver_unidad','P06-N3','{}',now() - interval '3423 minutes');
insert into sesiones (id,created_at,device) values ('20000000-0000-4000-8000-000000000022', now() - interval '5798 minutes', 'mobile');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000022','ver_unidad','P03-S3','{}',now() - interval '7574 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000022','ver_unidad','P09-N1','{}',now() - interval '8795 minutes');
insert into sesiones (id,created_at,device) values ('20000000-0000-4000-8000-000000000023', now() - interval '7572 minutes', 'mobile');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000023','ver_unidad','P07-N3','{}',now() - interval '5262 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000023','ver_unidad','P01-N2','{}',now() - interval '4788 minutes');
insert into sesiones (id,created_at,device) values ('20000000-0000-4000-8000-000000000024', now() - interval '3080 minutes', 'desktop');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000024','ver_unidad','P07-N2','{}',now() - interval '8566 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000024','ver_unidad','P10-N1','{}',now() - interval '846 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000024','ver_unidad','P02-N3','{}',now() - interval '7523 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000024','ver_unidad','P06-N1','{}',now() - interval '1501 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000024','P06-N1') on conflict do nothing;
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000024','ver_unidad','P07-N2','{}',now() - interval '891 minutes');
insert into sesiones (id,created_at,device) values ('20000000-0000-4000-8000-000000000025', now() - interval '1761 minutes', 'desktop');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000025','ver_unidad','P10-S3','{}',now() - interval '1394 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000025','ver_unidad','P12-S2','{}',now() - interval '9819 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000025','P12-S2') on conflict do nothing;
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000025','ver_unidad','P07-N2','{}',now() - interval '4941 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000025','ver_unidad','P08-N2','{}',now() - interval '9761 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000025','ver_unidad','P03-S2','{}',now() - interval '9545 minutes');
insert into sesiones (id,created_at,device) values ('20000000-0000-4000-8000-000000000026', now() - interval '4851 minutes', 'mobile');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000026','ver_unidad','P05-E','{}',now() - interval '649 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000026','ver_unidad','P05-S1','{}',now() - interval '971 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000026','ver_unidad','P06-N3','{}',now() - interval '624 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000026','P06-N3') on conflict do nothing;
insert into sesiones (id,created_at,device) values ('20000000-0000-4000-8000-000000000027', now() - interval '299 minutes', 'mobile');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000027','ver_unidad','P04-N2','{}',now() - interval '2189 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000027','P04-N2') on conflict do nothing;
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000027','ver_unidad','P07-E','{}',now() - interval '8988 minutes');
insert into sesiones (id,created_at,device) values ('20000000-0000-4000-8000-000000000028', now() - interval '7442 minutes', 'mobile');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000028','ver_unidad','P09-N1','{}',now() - interval '3985 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000028','ver_unidad','P06-N1','{}',now() - interval '101 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000028','ver_unidad','P01-S2','{}',now() - interval '3806 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000028','P01-S2') on conflict do nothing;
insert into sesiones (id,created_at,device) values ('20000000-0000-4000-8000-000000000029', now() - interval '9837 minutes', 'mobile');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000029','ver_unidad','P06-N3','{}',now() - interval '3189 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000029','ver_unidad','P12-E','{}',now() - interval '9508 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000029','P12-E') on conflict do nothing;
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000029','ver_unidad','P09-N3','{}',now() - interval '2292 minutes');
insert into sesiones (id,created_at,device) values ('20000000-0000-4000-8000-000000000030', now() - interval '9335 minutes', 'mobile');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000030','ver_unidad','P07-S3','{}',now() - interval '9914 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000030','ver_unidad','P06-N2','{}',now() - interval '1590 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000030','ver_unidad','P07-N3','{}',now() - interval '385 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000030','ver_unidad','P06-N3','{}',now() - interval '2015 minutes');
insert into sesiones (id,created_at,device) values ('20000000-0000-4000-8000-000000000031', now() - interval '7429 minutes', 'mobile');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000031','ver_unidad','P02-S1','{}',now() - interval '4658 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000031','ver_unidad','P06-N2','{}',now() - interval '6923 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000031','ver_unidad','P09-N2','{}',now() - interval '749 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000031','P09-N2') on conflict do nothing;
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000031','ver_unidad','P06-N2','{}',now() - interval '5946 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000031','ver_unidad','P07-N3','{}',now() - interval '9458 minutes');
insert into sesiones (id,created_at,device) values ('20000000-0000-4000-8000-000000000032', now() - interval '8592 minutes', 'desktop');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000032','ver_unidad','P12-N1','{}',now() - interval '7333 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000032','P12-N1') on conflict do nothing;
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000032','ver_unidad','P06-N2','{}',now() - interval '8185 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000032','ver_unidad','P06-N3','{}',now() - interval '2064 minutes');
insert into sesiones (id,created_at,device) values ('20000000-0000-4000-8000-000000000033', now() - interval '3424 minutes', 'mobile');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000033','ver_unidad','P09-N2','{}',now() - interval '7327 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000033','ver_unidad','P06-N2','{}',now() - interval '4731 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000033','ver_unidad','P02-W','{}',now() - interval '7967 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000033','P02-W') on conflict do nothing;
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000033','ver_unidad','P04-S2','{}',now() - interval '2090 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000033','ver_unidad','P06-N2','{}',now() - interval '8027 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000033','ver_unidad','P06-N3','{}',now() - interval '7756 minutes');
insert into sesiones (id,created_at,device) values ('20000000-0000-4000-8000-000000000034', now() - interval '2515 minutes', 'desktop');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000034','ver_unidad','P02-N3','{}',now() - interval '3833 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000034','P02-N3') on conflict do nothing;
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000034','ver_unidad','P06-N2','{}',now() - interval '5410 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000034','P06-N2') on conflict do nothing;
insert into sesiones (id,created_at,device) values ('20000000-0000-4000-8000-000000000035', now() - interval '132 minutes', 'desktop');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000035','ver_unidad','P09-E','{}',now() - interval '4569 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000035','ver_unidad','P09-N1','{}',now() - interval '8699 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000035','ver_unidad','P08-N3','{}',now() - interval '552 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000035','ver_unidad','P09-S2','{}',now() - interval '1251 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000035','ver_unidad','P07-N1','{}',now() - interval '2621 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000035','ver_unidad','P04-N2','{}',now() - interval '6353 minutes');
insert into sesiones (id,created_at,device) values ('20000000-0000-4000-8000-000000000036', now() - interval '5155 minutes', 'mobile');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000036','ver_unidad','P07-N2','{}',now() - interval '8658 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000036','ver_unidad','P12-E','{}',now() - interval '5661 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000036','ver_unidad','P01-N3','{}',now() - interval '1490 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000036','ver_unidad','P03-E','{}',now() - interval '9185 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000036','ver_unidad','P11-W','{}',now() - interval '6131 minutes');
insert into sesiones (id,created_at,device) values ('20000000-0000-4000-8000-000000000037', now() - interval '3786 minutes', 'mobile');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000037','ver_unidad','P03-N1','{}',now() - interval '6985 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000037','ver_unidad','P07-N3','{}',now() - interval '3659 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000037','P07-N3') on conflict do nothing;
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000037','ver_unidad','P08-N3','{}',now() - interval '4008 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000037','ver_unidad','P03-N2','{}',now() - interval '6556 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000037','ver_unidad','P09-N1','{}',now() - interval '8632 minutes');
insert into sesiones (id,created_at,device) values ('20000000-0000-4000-8000-000000000038', now() - interval '1795 minutes', 'mobile');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000038','ver_unidad','P08-N1','{}',now() - interval '4350 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000038','ver_unidad','P06-N2','{}',now() - interval '2277 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000038','ver_unidad','P02-W','{}',now() - interval '2515 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000038','ver_unidad','P08-N1','{}',now() - interval '3170 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000038','ver_unidad','P08-S2','{}',now() - interval '7214 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000038','ver_unidad','P10-E','{}',now() - interval '9610 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000038','P10-E') on conflict do nothing;
insert into sesiones (id,created_at,device) values ('20000000-0000-4000-8000-000000000039', now() - interval '3872 minutes', 'mobile');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000039','ver_unidad','P06-N3','{}',now() - interval '6801 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000039','ver_unidad','P03-S2','{}',now() - interval '7227 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000039','P03-S2') on conflict do nothing;
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000039','ver_unidad','P07-N2','{}',now() - interval '1365 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000039','P07-N2') on conflict do nothing;
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000039','ver_unidad','P08-E','{}',now() - interval '2355 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000039','ver_unidad','P08-N1','{}',now() - interval '4002 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000039','P08-N1') on conflict do nothing;
insert into sesiones (id,created_at,device) values ('20000000-0000-4000-8000-000000000040', now() - interval '4300 minutes', 'mobile');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000040','ver_unidad','P07-N1','{}',now() - interval '3469 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000040','P07-N1') on conflict do nothing;
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000040','ver_unidad','P06-N2','{}',now() - interval '1245 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000040','ver_unidad','P08-N2','{}',now() - interval '3941 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000040','ver_unidad','P09-N2','{}',now() - interval '9336 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000040','P09-N2') on conflict do nothing;
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000040','ver_unidad','P06-N1','{}',now() - interval '2231 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000040','ver_unidad','P04-N1','{}',now() - interval '8426 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000040','P04-N1') on conflict do nothing;
insert into sesiones (id,created_at,device) values ('20000000-0000-4000-8000-000000000041', now() - interval '8654 minutes', 'mobile');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000041','ver_unidad','P08-N1','{}',now() - interval '8388 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000041','ver_unidad','P04-S3','{}',now() - interval '2021 minutes');
insert into sesiones (id,created_at,device) values ('20000000-0000-4000-8000-000000000042', now() - interval '6023 minutes', 'mobile');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000042','ver_unidad','P06-N1','{}',now() - interval '1746 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000042','ver_unidad','P07-N3','{}',now() - interval '2220 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000042','P07-N3') on conflict do nothing;
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000042','ver_unidad','P01-N1','{}',now() - interval '57 minutes');
insert into sesiones (id,created_at,device) values ('20000000-0000-4000-8000-000000000043', now() - interval '7574 minutes', 'desktop');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000043','ver_unidad','P11-N2','{}',now() - interval '600 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000043','ver_unidad','P08-N3','{}',now() - interval '2566 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000043','ver_unidad','P07-N2','{}',now() - interval '6789 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000043','P07-N2') on conflict do nothing;
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000043','ver_unidad','P04-E','{}',now() - interval '8312 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000043','ver_unidad','P02-S1','{}',now() - interval '8185 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000043','P02-S1') on conflict do nothing;
insert into sesiones (id,created_at,device) values ('20000000-0000-4000-8000-000000000044', now() - interval '372 minutes', 'mobile');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000044','ver_unidad','P08-N2','{}',now() - interval '480 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000044','ver_unidad','P07-N1','{}',now() - interval '1452 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000044','P07-N1') on conflict do nothing;
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000044','ver_unidad','P09-N1','{}',now() - interval '2966 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000044','ver_unidad','P04-S1','{}',now() - interval '5674 minutes');
insert into sesiones (id,created_at,device) values ('20000000-0000-4000-8000-000000000045', now() - interval '3823 minutes', 'mobile');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000045','ver_unidad','P07-E','{}',now() - interval '4033 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000045','ver_unidad','P09-S2','{}',now() - interval '2561 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000045','P09-S2') on conflict do nothing;
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000045','ver_unidad','P06-N3','{}',now() - interval '737 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000045','ver_unidad','P06-N3','{}',now() - interval '7363 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000045','ver_unidad','P10-N2','{}',now() - interval '3205 minutes');
insert into sesiones (id,created_at,device) values ('20000000-0000-4000-8000-000000000046', now() - interval '6359 minutes', 'mobile');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000046','ver_unidad','P06-N2','{}',now() - interval '7365 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000046','ver_unidad','P06-S1','{}',now() - interval '6876 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000046','ver_unidad','P07-N3','{}',now() - interval '6644 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000046','P07-N3') on conflict do nothing;
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000046','ver_unidad','P03-S2','{}',now() - interval '6680 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000046','P03-S2') on conflict do nothing;
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000046','ver_unidad','P07-S3','{}',now() - interval '569 minutes');
insert into sesiones (id,created_at,device) values ('20000000-0000-4000-8000-000000000047', now() - interval '6332 minutes', 'desktop');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000047','ver_unidad','P08-N3','{}',now() - interval '8839 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000047','P08-N3') on conflict do nothing;
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000047','ver_unidad','P07-S3','{}',now() - interval '9093 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000047','P07-S3') on conflict do nothing;
insert into sesiones (id,created_at,device) values ('20000000-0000-4000-8000-000000000048', now() - interval '3628 minutes', 'mobile');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000048','ver_unidad','P10-N3','{}',now() - interval '9972 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000048','P10-N3') on conflict do nothing;
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000048','ver_unidad','P06-N2','{}',now() - interval '2794 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000048','P06-N2') on conflict do nothing;
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000048','ver_unidad','P09-N3','{}',now() - interval '8164 minutes');
insert into sesiones (id,created_at,device) values ('20000000-0000-4000-8000-000000000049', now() - interval '7417 minutes', 'mobile');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000049','ver_unidad','P06-N1','{}',now() - interval '6998 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000049','ver_unidad','P10-W','{}',now() - interval '3034 minutes');
insert into sesiones (id,created_at,device) values ('20000000-0000-4000-8000-000000000050', now() - interval '9116 minutes', 'desktop');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000050','ver_unidad','P09-N2','{}',now() - interval '6492 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000050','ver_unidad','P09-N2','{}',now() - interval '7451 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000050','ver_unidad','P10-W','{}',now() - interval '4628 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000050','P10-W') on conflict do nothing;
insert into sesiones (id,created_at,device) values ('20000000-0000-4000-8000-000000000051', now() - interval '5737 minutes', 'mobile');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000051','ver_unidad','P02-N1','{}',now() - interval '4728 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000051','P02-N1') on conflict do nothing;
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000051','ver_unidad','P09-S1','{}',now() - interval '3922 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000051','ver_unidad','P03-E','{}',now() - interval '497 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000051','P03-E') on conflict do nothing;
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000051','ver_unidad','P09-N3','{}',now() - interval '2955 minutes');
insert into sesiones (id,created_at,device) values ('20000000-0000-4000-8000-000000000052', now() - interval '1500 minutes', 'desktop');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000052','ver_unidad','P07-N3','{}',now() - interval '2304 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000052','ver_unidad','P07-N1','{}',now() - interval '8607 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000052','P07-N1') on conflict do nothing;
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000052','ver_unidad','P08-N3','{}',now() - interval '423 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000052','ver_unidad','P07-N3','{}',now() - interval '7834 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000052','P07-N3') on conflict do nothing;
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000052','ver_unidad','P07-N3','{}',now() - interval '1284 minutes');
insert into sesiones (id,created_at,device) values ('20000000-0000-4000-8000-000000000053', now() - interval '418 minutes', 'mobile');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000053','ver_unidad','P09-N1','{}',now() - interval '8025 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000053','ver_unidad','P08-N1','{}',now() - interval '5558 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000053','P08-N1') on conflict do nothing;
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000053','ver_unidad','P07-N1','{}',now() - interval '3349 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000053','ver_unidad','P03-N1','{}',now() - interval '4244 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000053','ver_unidad','P08-N1','{}',now() - interval '1111 minutes');
insert into sesiones (id,created_at,device) values ('20000000-0000-4000-8000-000000000054', now() - interval '8108 minutes', 'mobile');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000054','ver_unidad','P06-N1','{}',now() - interval '5513 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000054','ver_unidad','P01-N1','{}',now() - interval '9815 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000054','ver_unidad','P01-E','{}',now() - interval '4670 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000054','ver_unidad','P04-S3','{}',now() - interval '5742 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000054','ver_unidad','P06-N1','{}',now() - interval '1639 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000054','P06-N1') on conflict do nothing;
insert into sesiones (id,created_at,device) values ('20000000-0000-4000-8000-000000000055', now() - interval '268 minutes', 'desktop');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000055','ver_unidad','P09-N2','{}',now() - interval '9587 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000055','ver_unidad','P12-S1','{}',now() - interval '1991 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000055','ver_unidad','P11-N2','{}',now() - interval '8716 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000055','ver_unidad','P07-N1','{}',now() - interval '875 minutes');
insert into sesiones (id,created_at,device) values ('20000000-0000-4000-8000-000000000056', now() - interval '1471 minutes', 'mobile');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000056','ver_unidad','P07-N3','{}',now() - interval '8712 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000056','ver_unidad','P08-N3','{}',now() - interval '7939 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000056','ver_unidad','P08-N3','{}',now() - interval '4162 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000056','ver_unidad','P01-S2','{}',now() - interval '10019 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000056','P01-S2') on conflict do nothing;
insert into sesiones (id,created_at,device) values ('20000000-0000-4000-8000-000000000057', now() - interval '5514 minutes', 'mobile');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000057','ver_unidad','P09-N2','{}',now() - interval '6958 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000057','P09-N2') on conflict do nothing;
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000057','ver_unidad','P05-S1','{}',now() - interval '4005 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000057','ver_unidad','P07-N2','{}',now() - interval '8699 minutes');
insert into sesiones (id,created_at,device) values ('20000000-0000-4000-8000-000000000058', now() - interval '4500 minutes', 'desktop');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000058','ver_unidad','P10-W','{}',now() - interval '8727 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000058','ver_unidad','P08-N3','{}',now() - interval '2095 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000058','ver_unidad','P09-N1','{}',now() - interval '3289 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000058','ver_unidad','P08-N3','{}',now() - interval '6907 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000058','ver_unidad','P08-N2','{}',now() - interval '9407 minutes');
insert into sesiones (id,created_at,device) values ('20000000-0000-4000-8000-000000000059', now() - interval '6860 minutes', 'desktop');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000059','ver_unidad','P09-N3','{}',now() - interval '1302 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000059','ver_unidad','P11-S1','{}',now() - interval '4781 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000059','P11-S1') on conflict do nothing;
insert into sesiones (id,created_at,device) values ('20000000-0000-4000-8000-000000000060', now() - interval '6637 minutes', 'desktop');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000060','ver_unidad','P08-N1','{}',now() - interval '3670 minutes');
insert into favoritos (sesion_id,unidad_id) values ('20000000-0000-4000-8000-000000000060','P08-N1') on conflict do nothing;
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000060','ver_unidad','P06-N2','{}',now() - interval '3966 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000060','ver_unidad','P09-N1','{}',now() - interval '6782 minutes');
insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values ('20000000-0000-4000-8000-000000000060','ver_unidad','P09-N3','{}',now() - interval '955 minutes');
