-- Custom SQL migration file for mock data

-- Insert mock categories
INSERT INTO "category" ("id", "name", "color") VALUES
  (gen_random_uuid(), 'Academic', '#3B82F6'),
  (gen_random_uuid(), 'Events', '#10B981'),
  (gen_random_uuid(), 'Administrative', '#F59E0B'),
  (gen_random_uuid(), 'Scholarships', '#8B5CF6'),
  (gen_random_uuid(), 'Campus Life', '#EC4899'),
  (gen_random_uuid(), 'Research', '#6366F1');

-- Insert mock authors
INSERT INTO "author" ("id", "name", "role", "department", "avatar") VALUES
  (gen_random_uuid(), 'Dr. Sarah Johnson', 'Dean', 'Faculty of Science', NULL),
  (gen_random_uuid(), 'Prof. Michael Chen', 'Head of Department', 'Computer Science', NULL),
  (gen_random_uuid(), 'Dr. Emily Rodriguez', 'Student Affairs Director', 'Student Services', NULL),
  (gen_random_uuid(), 'Prof. David Williams', 'Research Coordinator', 'Research Office', NULL);

-- Create a test user if not exists
INSERT INTO "user" ("id", "name", "email", "user_role")
SELECT gen_random_uuid(), 'Test User', 'test@example.com', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM "user" WHERE "email" = 'test@example.com');

-- Get IDs for reference (using variables to store IDs)
DO $$
DECLARE
    academic_cat_id UUID;
    events_cat_id UUID;
    admin_cat_id UUID;
    scholarships_cat_id UUID;
    campus_cat_id UUID;
    research_cat_id UUID;
    
    sarah_id UUID;
    michael_id UUID;
    emily_id UUID;
    david_id UUID;
    
    test_user_id UUID;
    
    ann1_id UUID;
    ann2_id UUID;
    ann3_id UUID;
    ann4_id UUID;
    ann5_id UUID;
    ann6_id UUID;
    ann7_id UUID;
    ann8_id UUID;
    ann9_id UUID;
    ann10_id UUID;
BEGIN
    -- Get category IDs
    SELECT "id" INTO academic_cat_id FROM "category" WHERE "name" = 'Academic' LIMIT 1;
    SELECT "id" INTO events_cat_id FROM "category" WHERE "name" = 'Events' LIMIT 1;
    SELECT "id" INTO admin_cat_id FROM "category" WHERE "name" = 'Administrative' LIMIT 1;
    SELECT "id" INTO scholarships_cat_id FROM "category" WHERE "name" = 'Scholarships' LIMIT 1;
    SELECT "id" INTO campus_cat_id FROM "category" WHERE "name" = 'Campus Life' LIMIT 1;
    SELECT "id" INTO research_cat_id FROM "category" WHERE "name" = 'Research' LIMIT 1;
    
    -- Get author IDs
    SELECT "id" INTO sarah_id FROM "author" WHERE "name" = 'Dr. Sarah Johnson' LIMIT 1;
    SELECT "id" INTO michael_id FROM "author" WHERE "name" = 'Prof. Michael Chen' LIMIT 1;
    SELECT "id" INTO emily_id FROM "author" WHERE "name" = 'Dr. Emily Rodriguez' LIMIT 1;
    SELECT "id" INTO david_id FROM "author" WHERE "name" = 'Prof. David Williams' LIMIT 1;
    
    -- Get test user ID
    SELECT "id" INTO test_user_id FROM "user" WHERE "email" = 'test@example.com' LIMIT 1;
    
    -- Insert mock announcements
    INSERT INTO "announcement" ("id", "title", "content", "date", "category_id", "author_id", "is_important") VALUES
      (gen_random_uuid(), 'Final Exam Schedule Released', 'The final examination schedule for the Spring semester has been released. Please check the university portal for your personalized exam timetable. All students are required to verify their exam dates and locations at least one week before the examination period begins.

If you have any scheduling conflicts, please contact the Examinations Office immediately. Requests for rescheduling due to conflicts must be submitted no later than two weeks before the examination period.

Students requiring special accommodations should have already registered with the Accessibility Services. If you haven''t done so and need accommodations, please contact them as soon as possible.', '2025-05-01 09:00:00+00', academic_cat_id, sarah_id, TRUE)
    RETURNING "id" INTO ann1_id;
    
    INSERT INTO "announcement" ("id", "title", "content", "date", "category_id", "author_id", "is_important") VALUES
      (gen_random_uuid(), 'Annual University Gala - Tickets Now Available', 'The Annual University Gala will be held on June 15th at the Grand Hall. This year''s theme is ''Innovation and Tradition''. Tickets are now available for purchase at the Student Union building or online through the university portal.

The event will feature performances from student groups, an awards ceremony recognizing outstanding achievements, and a dinner prepared by renowned chef Marcus Bell. Formal attire is required.

All proceeds from the event will go towards the University Scholarship Fund, which supports students with financial needs.', '2025-05-02 14:30:00+00', events_cat_id, emily_id, FALSE)
    RETURNING "id" INTO ann2_id;
    
    INSERT INTO "announcement" ("id", "title", "content", "date", "category_id", "author_id", "is_important") VALUES
      (gen_random_uuid(), 'Library Hours Extended During Finals Week', 'To support students during the final examination period, the University Library will extend its operating hours. From May 20th to June 5th, the library will be open 24 hours a day.

Additional study spaces will be available on the second and third floors. The quiet study areas on the fourth floor will have increased capacity with temporary workstations.

The library café will also extend its hours until midnight each day during this period, offering a variety of snacks and beverages to help you stay energized during your study sessions.', '2025-05-03 11:15:00+00', campus_cat_id, emily_id, FALSE)
    RETURNING "id" INTO ann3_id;
    
    INSERT INTO "announcement" ("id", "title", "content", "date", "category_id", "author_id", "is_important") VALUES
      (gen_random_uuid(), 'New Research Grant Opportunities', 'The Office of Research is pleased to announce new grant opportunities for faculty and graduate students. The University has received funding from the National Science Foundation for research in sustainable technologies, artificial intelligence, and climate science.

Interested researchers should submit a letter of intent by May 30th. Full proposals will be due by July 15th. Information sessions about the application process will be held on May 10th and May 17th in the Research Building, Room 302.

For more details about eligibility criteria and application guidelines, please visit the Research Office website or contact the Research Development team.', '2025-05-04 10:00:00+00', research_cat_id, david_id, TRUE)
    RETURNING "id" INTO ann4_id;
    
    INSERT INTO "announcement" ("id", "title", "content", "date", "category_id", "author_id", "is_important") VALUES
      (gen_random_uuid(), 'Tuition Payment Deadline for Fall Semester', 'This is a reminder that the deadline for Fall semester tuition payment is July 31st. Students who have not paid their tuition or arranged for a payment plan by this date may have their course registrations cancelled.

Payment can be made online through the Student Financial Services portal, by mail, or in person at the Bursar''s Office. Various payment plans are available for students who cannot pay the full amount by the deadline.

If you are expecting financial aid or scholarships, please ensure that all required documentation has been submitted to the Financial Aid Office.', '2025-05-05 09:30:00+00', admin_cat_id, emily_id, TRUE)
    RETURNING "id" INTO ann5_id;
    
    INSERT INTO "announcement" ("id", "title", "content", "date", "category_id", "author_id", "is_important") VALUES
      (gen_random_uuid(), 'Summer Research Internship Applications Open', 'Applications are now open for the Summer Research Internship Program. This program offers undergraduate students the opportunity to work closely with faculty members on research projects across various disciplines.

The internship runs for 10 weeks during the summer break and includes a stipend of $3,000. Housing on campus is available for interns at a subsidized rate.

To apply, students must submit a resume, academic transcript, and a statement of research interests. Applications are due by May 15th. Selected candidates will be notified by June 1st.', '2025-05-06 15:45:00+00', research_cat_id, david_id, FALSE)
    RETURNING "id" INTO ann6_id;
    
    INSERT INTO "announcement" ("id", "title", "content", "date", "category_id", "author_id", "is_important") VALUES
      (gen_random_uuid(), 'New Scholarship Opportunity for International Students', 'The University is pleased to announce a new scholarship program for international students. The Global Excellence Scholarship will cover up to 50% of tuition fees for outstanding international students who demonstrate academic excellence and leadership potential.

Eligible students must have a GPA of at least 3.5 and be enrolled full-time in an undergraduate or graduate program. The scholarship is renewable annually, subject to maintaining academic performance.

Application deadline is June 30th for the upcoming academic year. For more information and to apply, please visit the International Student Services office or their website.', '2025-05-07 13:20:00+00', scholarships_cat_id, sarah_id, TRUE)
    RETURNING "id" INTO ann7_id;
    
    INSERT INTO "announcement" ("id", "title", "content", "date", "category_id", "author_id", "is_important") VALUES
      (gen_random_uuid(), 'Campus Sustainability Initiative Launch', 'The University is launching a new sustainability initiative aimed at reducing our carbon footprint and promoting environmental responsibility across campus. The initiative includes several new programs and policies:

- Installation of solar panels on major campus buildings
- Expansion of recycling and composting facilities
- Reduction of single-use plastics in dining facilities
- Creation of a student-led Sustainability Committee

Students interested in joining the Sustainability Committee should attend the informational meeting on May 12th at 4:00 PM in the Student Union Building, Room 203.', '2025-05-08 16:00:00+00', campus_cat_id, emily_id, FALSE)
    RETURNING "id" INTO ann8_id;
    
    INSERT INTO "announcement" ("id", "title", "content", "date", "category_id", "author_id", "is_important") VALUES
      (gen_random_uuid(), 'Faculty Development Workshop Series', 'The Center for Teaching Excellence is hosting a series of faculty development workshops throughout May and June. Topics include innovative teaching methods, incorporating technology in the classroom, promoting inclusive learning environments, and research-based teaching strategies.

All workshops will be held in the Faculty Development Center and will also be available via live streaming for those who cannot attend in person. Certificates of participation will be provided.

Registration is required and can be completed through the Center for Teaching Excellence website. Space is limited for in-person attendance, so early registration is encouraged.', '2025-05-09 11:00:00+00', admin_cat_id, michael_id, FALSE)
    RETURNING "id" INTO ann9_id;
    
    INSERT INTO "announcement" ("id", "title", "content", "date", "category_id", "author_id", "is_important") VALUES
      (gen_random_uuid(), 'New Course Offerings for Fall Semester', 'The University is excited to announce several new courses that will be offered in the Fall semester. These courses reflect emerging fields of study and respond to student interests:

- AI Ethics and Society (COMP 3050)
- Climate Change Policy (ENVS 4020)
- Digital Humanities Research Methods (HUMN 3100)
- Entrepreneurship in Healthcare (BUSN 3750)
- Advanced Data Visualization (STAT 4150)

Course descriptions and prerequisites can be found in the updated course catalog. Registration for these courses will open with general course registration on June 1st.', '2025-05-10 09:45:00+00', academic_cat_id, michael_id, FALSE)
    RETURNING "id" INTO ann10_id;
    
    -- Insert mock attachments
    INSERT INTO "attachment" ("id", "announcement_id", "name", "url", "type") VALUES
      (gen_random_uuid(), ann1_id, 'Exam_Schedule_Spring_2025.pdf', '/documents/exam_schedule.pdf', 'pdf');
      
    INSERT INTO "attachment" ("id", "announcement_id", "name", "url", "type") VALUES
      (gen_random_uuid(), ann2_id, 'Gala_Invitation.pdf', '/documents/gala_invitation.pdf', 'pdf'),
      (gen_random_uuid(), ann2_id, 'Venue_Map.jpg', '/images/venue_map.jpg', 'image');
      
    INSERT INTO "attachment" ("id", "announcement_id", "name", "url", "type") VALUES
      (gen_random_uuid(), ann4_id, 'Research_Grant_Guidelines.pdf', '/documents/research_guidelines.pdf', 'pdf');
      
    INSERT INTO "attachment" ("id", "announcement_id", "name", "url", "type") VALUES
      (gen_random_uuid(), ann6_id, 'Internship_Application_Form.doc', '/documents/internship_application.doc', 'doc');
      
    INSERT INTO "attachment" ("id", "announcement_id", "name", "url", "type") VALUES
      (gen_random_uuid(), ann9_id, 'Workshop_Schedule.pdf', '/documents/workshop_schedule.pdf', 'pdf');
    
    -- Insert mock bookmarks for test user
    INSERT INTO "user_bookmark" ("id", "user_id", "announcement_id") VALUES
      (gen_random_uuid(), test_user_id, ann1_id),
      (gen_random_uuid(), test_user_id, ann4_id),
      (gen_random_uuid(), test_user_id, ann7_id);
END $$;