-- Mock Users (admin, faculty, students)
INSERT INTO "user" (id, name, email, user_role) VALUES
('00000000-0000-4000-8000-000000000001', 'Admin User', 'admin@university.edu', 'admin'),
('00000000-0000-4000-8000-000000000002', 'Professor Smith', 'smith@university.edu', 'faculty'),
('00000000-0000-4000-8000-000000000003', 'Professor Jones', 'jones@university.edu', 'faculty'),
('00000000-0000-4000-8000-000000000004', 'John Student', 'john@university.edu', 'student'),
('00000000-0000-4000-8000-000000000005', 'Jane Student', 'jane@university.edu', 'student');

-- Mock Announcements
INSERT INTO "announcement" (id, title, content, created_by_id, is_pinned) VALUES
('00000000-0000-4000-8000-000000000010', 'Welcome to Spring Semester', 'Welcome back students! Here are the important dates for this semester...', '00000000-0000-4000-8000-000000000001', true),
('00000000-0000-4000-8000-000000000011', 'Library Hours Extended', 'The library will now be open 24/7 during exam period', '00000000-0000-4000-8000-000000000002', false),
('00000000-0000-4000-8000-000000000012', 'Campus Maintenance Notice', 'The north parking lot will be closed for maintenance next week', '00000000-0000-4000-8000-000000000001', false);

-- Mock Comments
INSERT INTO "comment" (id, content, user_id, announcement_id) VALUES
('00000000-0000-4000-8000-000000000020', 'Thanks for the update!', '00000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000010'),
('00000000-0000-4000-8000-000000000021', 'Will there be alternative parking available?', '00000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000000012'),
('00000000-0000-4000-8000-000000000022', 'This is great news for late-night study sessions', '00000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000011');

-- Mock Help Requests
INSERT INTO "help_request" (id, title, description, request_status, created_by_id) VALUES
('00000000-0000-4000-8000-000000000030', 'Cannot access online library', 'Getting an error when trying to access the digital library resources', 'open', '00000000-0000-4000-8000-000000000004'),
('00000000-0000-4000-8000-000000000031', 'Student ID card not working', 'My ID card stopped working at the gym entrance', 'in_progress', '00000000-0000-4000-8000-000000000005'),
('00000000-0000-4000-8000-000000000032', 'Course registration issue', 'Need help with prerequisite override for Advanced Physics', 'resolved', '00000000-0000-4000-8000-000000000004');