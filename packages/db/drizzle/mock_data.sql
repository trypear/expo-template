-- Insert mock users
INSERT INTO "user" ("id", "name", "email", "emailVerified", "image", "createdAt", "updatedAt")
VALUES 
  ('usr_1', 'Admin User', 'admin@example.com', NOW(), 'https://ui-avatars.com/api/?name=Admin+User', NOW(), NOW()),
  ('usr_2', 'Test User', 'test@example.com', NOW(), 'https://ui-avatars.com/api/?name=Test+User', NOW(), NOW());

-- Insert mock facts
INSERT INTO "fact" ("id", "content", "category", "createdBy", "isActive", "createdAt", "updatedAt")
VALUES
  ('fact_1', 'The shortest war in history was between Britain and Zanzibar on August 27, 1896. Zanzibar surrendered after 38 minutes.', 'History', 'usr_1', true, NOW(), NOW()),
  ('fact_2', 'Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly good to eat.', 'Food', 'usr_1', true, NOW(), NOW()),
  ('fact_3', 'A day on Venus is longer than a year on Venus. It takes 243 Earth days to rotate once on its axis (a day) and 225 Earth days to orbit the sun (a year).', 'Space', 'usr_1', true, NOW(), NOW()),
  ('fact_4', 'The Great Barrier Reef is the largest living structure on Earth, stretching over 1,400 miles.', 'Nature', 'usr_1', true, NOW(), NOW()),
  ('fact_5', 'Octopuses have three hearts, nine brains, and blue blood.', 'Animals', 'usr_1', true, NOW(), NOW()),
  ('fact_6', 'The average person will spend six months of their life waiting for red lights to turn green.', 'Lifestyle', 'usr_1', true, NOW(), NOW()),
  ('fact_7', 'The first computer programmer was a woman named Ada Lovelace, who worked on Charles Babbage''s Analytical Engine in the 1840s.', 'Technology', 'usr_1', true, NOW(), NOW()),
  ('fact_8', 'A group of flamingos is called a "flamboyance."', 'Animals', 'usr_1', true, NOW(), NOW()),
  ('fact_9', 'The world''s oldest known living tree is a Great Basin Bristlecone Pine that is over 5,000 years old.', 'Nature', 'usr_1', true, NOW(), NOW()),
  ('fact_10', 'The first message sent over the internet was "LO". It was supposed to be "LOGIN", but the system crashed after the first two letters.', 'Technology', 'usr_1', true, NOW(), NOW());

-- Insert mock fact queue entries (for the next 7 days)
INSERT INTO "factQueue" ("id", "factId", "scheduledDate", "isShown", "createdAt", "updatedAt")
VALUES
  ('fq_1', 'fact_1', CURRENT_DATE, false, NOW(), NOW()),
  ('fq_2', 'fact_2', CURRENT_DATE + INTERVAL '1 day', false, NOW(), NOW()),
  ('fq_3', 'fact_3', CURRENT_DATE + INTERVAL '2 days', false, NOW(), NOW()),
  ('fq_4', 'fact_4', CURRENT_DATE + INTERVAL '3 days', false, NOW(), NOW()),
  ('fq_5', 'fact_5', CURRENT_DATE + INTERVAL '4 days', false, NOW(), NOW()),
  ('fq_6', 'fact_6', CURRENT_DATE + INTERVAL '5 days', false, NOW(), NOW()),
  ('fq_7', 'fact_7', CURRENT_DATE + INTERVAL '6 days', false, NOW(), NOW());