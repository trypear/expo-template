-- Custom SQL migration file, put your code below! --

-- Insert mock users if they don't exist
INSERT INTO "user" ("name", "email", "email_verified", "image")
VALUES
  ('Admin User', 'admin@example.com', NOW(), 'https://ui-avatars.com/api/?name=Admin+User'),
  ('Test User', 'test@example.com', NOW(), 'https://ui-avatars.com/api/?name=Test+User')
ON CONFLICT DO NOTHING;

-- Get the user IDs for reference
DO $$
DECLARE
  admin_id UUID;
BEGIN
  SELECT id INTO admin_id FROM "user" WHERE email = 'admin@example.com' LIMIT 1;

  -- Insert mock facts
  INSERT INTO "fact" ("content", "category", "createdBy", "is_active")
  VALUES
    ('The shortest war in history was between Britain and Zanzibar on August 27, 1896. Zanzibar surrendered after 38 minutes.', 'History', admin_id, true),
    ('Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly good to eat.', 'Food', admin_id, true),
    ('A day on Venus is longer than a year on Venus. It takes 243 Earth days to rotate once on its axis (a day) and 225 Earth days to orbit the sun (a year).', 'Space', admin_id, true),
    ('The Great Barrier Reef is the largest living structure on Earth, stretching over 1,400 miles.', 'Nature', admin_id, true),
    ('Octopuses have three hearts, nine brains, and blue blood.', 'Animals', admin_id, true),
    ('The average person will spend six months of their life waiting for red lights to turn green.', 'Lifestyle', admin_id, true),
    ('The first computer programmer was a woman named Ada Lovelace, who worked on Charles Babbage''s Analytical Engine in the 1840s.', 'Technology', admin_id, true),
    ('A group of flamingos is called a "flamboyance."', 'Animals', admin_id, true),
    ('The world''s oldest known living tree is a Great Basin Bristlecone Pine that is over 5,000 years old.', 'Nature', admin_id, true),
    ('The first message sent over the internet was "LO". It was supposed to be "LOGIN", but the system crashed after the first two letters.', 'Technology', admin_id, true);

  -- Insert mock fact queue entries (for the next 7 days)
  -- We'll use a loop to get the fact IDs and schedule them
  DECLARE
    fact_ids UUID[];
    fact_id UUID;
    i INT;
  BEGIN
    -- Get all fact IDs
    SELECT array_agg(id) INTO fact_ids FROM "fact" WHERE "createdBy" = admin_id;
    
    -- Schedule facts for the next 7 days
    FOR i IN 0..6 LOOP
      -- Use modulo to cycle through the facts
      fact_id := fact_ids[(i % array_length(fact_ids, 1)) + 1];
      
      -- Insert into queue
      INSERT INTO "factQueue" ("factId", "scheduled_date", "is_shown")
      VALUES (fact_id, CURRENT_DATE + (i * INTERVAL '1 day'), false)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END;
END $$;