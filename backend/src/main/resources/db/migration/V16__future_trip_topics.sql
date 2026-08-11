CREATE TABLE IF NOT EXISTS future_trip_topics (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0
);

INSERT INTO future_trip_topics (title, description, sort_order) VALUES
('Āzija', 'Tālie Austrumi — Japāna, Taizeme un Vjetnama. Kultūra, virtuve un dabas skati.', 1),
('Ziemeļvalstis un Skandināvija', 'Fjordi, ziemeļblāzma un skandināvu pilsētas.', 2),
('Amerika', 'Ziemeļamerikas lielpilsētas un Dienvidamerikas piedzīvojumi.', 3),
('Āfrika', 'Safari, tuksneši un neaizmirstami dabas brīnumi.', 4),
('Klusā okeāna salas', 'Okeānijas salas un eksotiskas pludmales tālu no ierastā.', 5);
