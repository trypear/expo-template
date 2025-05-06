import { assert } from "@acme/utils";

// Define types for our data
export interface AnnouncementCategory {
	id: string;
	name: string;
	color: string;
}

export interface Announcement {
	id: string;
	title: string;
	content: string;
	date: string;
	categoryId: string;
	authorId: string;
	isImportant: boolean;
	attachments?: {
		id: string;
		name: string;
		url: string;
		type: "pdf" | "doc" | "image" | "other";
	}[];
}

export interface Author {
	id: string;
	name: string;
	role: string;
	department: string;
	avatar?: string;
}

// MOCK DATA - Replace with TRPC query
export const mockCategories: AnnouncementCategory[] = [
	{ id: "cat_1", name: "Academic", color: "#3B82F6" },
	{ id: "cat_2", name: "Events", color: "#10B981" },
	{ id: "cat_3", name: "Administrative", color: "#F59E0B" },
	{ id: "cat_4", name: "Scholarships", color: "#8B5CF6" },
	{ id: "cat_5", name: "Campus Life", color: "#EC4899" },
	{ id: "cat_6", name: "Research", color: "#6366F1" },
];

// MOCK DATA - Replace with TRPC query
export const mockAuthors: Author[] = [
	{
		id: "auth_1",
		name: "Dr. Sarah Johnson",
		role: "Dean",
		department: "Faculty of Science",
	},
	{
		id: "auth_2",
		name: "Prof. Michael Chen",
		role: "Head of Department",
		department: "Computer Science",
	},
	{
		id: "auth_3",
		name: "Dr. Emily Rodriguez",
		role: "Student Affairs Director",
		department: "Student Services",
	},
	{
		id: "auth_4",
		name: "Prof. David Williams",
		role: "Research Coordinator",
		department: "Research Office",
	},
];

// MOCK DATA - Replace with TRPC query
export const mockAnnouncements: Announcement[] = [
	{
		id: "ann_1",
		title: "Final Exam Schedule Released",
		content: "The final examination schedule for the Spring semester has been released. Please check the university portal for your personalized exam timetable. All students are required to verify their exam dates and locations at least one week before the examination period begins.\n\nIf you have any scheduling conflicts, please contact the Examinations Office immediately. Requests for rescheduling due to conflicts must be submitted no later than two weeks before the examination period.\n\nStudents requiring special accommodations should have already registered with the Accessibility Services. If you haven't done so and need accommodations, please contact them as soon as possible.",
		date: "2025-05-01T09:00:00Z",
		categoryId: "cat_1",
		authorId: "auth_1",
		isImportant: true,
		attachments: [
			{
				id: "att_1",
				name: "Exam_Schedule_Spring_2025.pdf",
				url: "/documents/exam_schedule.pdf",
				type: "pdf",
			},
		],
	},
	{
		id: "ann_2",
		title: "Annual University Gala - Tickets Now Available",
		content: "The Annual University Gala will be held on June 15th at the Grand Hall. This year's theme is 'Innovation and Tradition'. Tickets are now available for purchase at the Student Union building or online through the university portal.\n\nThe event will feature performances from student groups, an awards ceremony recognizing outstanding achievements, and a dinner prepared by renowned chef Marcus Bell. Formal attire is required.\n\nAll proceeds from the event will go towards the University Scholarship Fund, which supports students with financial needs.",
		date: "2025-05-02T14:30:00Z",
		categoryId: "cat_2",
		authorId: "auth_3",
		isImportant: false,
		attachments: [
			{
				id: "att_2",
				name: "Gala_Invitation.pdf",
				url: "/documents/gala_invitation.pdf",
				type: "pdf",
			},
			{
				id: "att_3",
				name: "Venue_Map.jpg",
				url: "/images/venue_map.jpg",
				type: "image",
			},
		],
	},
	{
		id: "ann_3",
		title: "Library Hours Extended During Finals Week",
		content: "To support students during the final examination period, the University Library will extend its operating hours. From May 20th to June 5th, the library will be open 24 hours a day.\n\nAdditional study spaces will be available on the second and third floors. The quiet study areas on the fourth floor will have increased capacity with temporary workstations.\n\nThe library café will also extend its hours until midnight each day during this period, offering a variety of snacks and beverages to help you stay energized during your study sessions.",
		date: "2025-05-03T11:15:00Z",
		categoryId: "cat_5",
		authorId: "auth_3",
		isImportant: false,
	},
	{
		id: "ann_4",
		title: "New Research Grant Opportunities",
		content: "The Office of Research is pleased to announce new grant opportunities for faculty and graduate students. The University has received funding from the National Science Foundation for research in sustainable technologies, artificial intelligence, and climate science.\n\nInterested researchers should submit a letter of intent by May 30th. Full proposals will be due by July 15th. Information sessions about the application process will be held on May 10th and May 17th in the Research Building, Room 302.\n\nFor more details about eligibility criteria and application guidelines, please visit the Research Office website or contact the Research Development team.",
		date: "2025-05-04T10:00:00Z",
		categoryId: "cat_6",
		authorId: "auth_4",
		isImportant: true,
		attachments: [
			{
				id: "att_4",
				name: "Research_Grant_Guidelines.pdf",
				url: "/documents/research_guidelines.pdf",
				type: "pdf",
			},
		],
	},
	{
		id: "ann_5",
		title: "Tuition Payment Deadline for Fall Semester",
		content: "This is a reminder that the deadline for Fall semester tuition payment is July 31st. Students who have not paid their tuition or arranged for a payment plan by this date may have their course registrations cancelled.\n\nPayment can be made online through the Student Financial Services portal, by mail, or in person at the Bursar's Office. Various payment plans are available for students who cannot pay the full amount by the deadline.\n\nIf you are expecting financial aid or scholarships, please ensure that all required documentation has been submitted to the Financial Aid Office.",
		date: "2025-05-05T09:30:00Z",
		categoryId: "cat_3",
		authorId: "auth_3",
		isImportant: true,
	},
	{
		id: "ann_6",
		title: "Summer Research Internship Applications Open",
		content: "Applications are now open for the Summer Research Internship Program. This program offers undergraduate students the opportunity to work closely with faculty members on research projects across various disciplines.\n\nThe internship runs for 10 weeks during the summer break and includes a stipend of $3,000. Housing on campus is available for interns at a subsidized rate.\n\nTo apply, students must submit a resume, academic transcript, and a statement of research interests. Applications are due by May 15th. Selected candidates will be notified by June 1st.",
		date: "2025-05-06T15:45:00Z",
		categoryId: "cat_6",
		authorId: "auth_4",
		isImportant: false,
		attachments: [
			{
				id: "att_5",
				name: "Internship_Application_Form.doc",
				url: "/documents/internship_application.doc",
				type: "doc",
			},
		],
	},
	{
		id: "ann_7",
		title: "New Scholarship Opportunity for International Students",
		content: "The University is pleased to announce a new scholarship program for international students. The Global Excellence Scholarship will cover up to 50% of tuition fees for outstanding international students who demonstrate academic excellence and leadership potential.\n\nEligible students must have a GPA of at least 3.5 and be enrolled full-time in an undergraduate or graduate program. The scholarship is renewable annually, subject to maintaining academic performance.\n\nApplication deadline is June 30th for the upcoming academic year. For more information and to apply, please visit the International Student Services office or their website.",
		date: "2025-05-07T13:20:00Z",
		categoryId: "cat_4",
		authorId: "auth_1",
		isImportant: true,
	},
	{
		id: "ann_8",
		title: "Campus Sustainability Initiative Launch",
		content: "The University is launching a new sustainability initiative aimed at reducing our carbon footprint and promoting environmental responsibility across campus. The initiative includes several new programs and policies:\n\n- Installation of solar panels on major campus buildings\n- Expansion of recycling and composting facilities\n- Reduction of single-use plastics in dining facilities\n- Creation of a student-led Sustainability Committee\n\nStudents interested in joining the Sustainability Committee should attend the informational meeting on May 12th at 4:00 PM in the Student Union Building, Room 203.",
		date: "2025-05-08T16:00:00Z",
		categoryId: "cat_5",
		authorId: "auth_3",
		isImportant: false,
	},
	{
		id: "ann_9",
		title: "Faculty Development Workshop Series",
		content: "The Center for Teaching Excellence is hosting a series of faculty development workshops throughout May and June. Topics include innovative teaching methods, incorporating technology in the classroom, promoting inclusive learning environments, and research-based teaching strategies.\n\nAll workshops will be held in the Faculty Development Center and will also be available via live streaming for those who cannot attend in person. Certificates of participation will be provided.\n\nRegistration is required and can be completed through the Center for Teaching Excellence website. Space is limited for in-person attendance, so early registration is encouraged.",
		date: "2025-05-09T11:00:00Z",
		categoryId: "cat_3",
		authorId: "auth_2",
		isImportant: false,
		attachments: [
			{
				id: "att_6",
				name: "Workshop_Schedule.pdf",
				url: "/documents/workshop_schedule.pdf",
				type: "pdf",
			},
		],
	},
	{
		id: "ann_10",
		title: "New Course Offerings for Fall Semester",
		content: "The University is excited to announce several new courses that will be offered in the Fall semester. These courses reflect emerging fields of study and respond to student interests:\n\n- AI Ethics and Society (COMP 3050)\n- Climate Change Policy (ENVS 4020)\n- Digital Humanities Research Methods (HUMN 3100)\n- Entrepreneurship in Healthcare (BUSN 3750)\n- Advanced Data Visualization (STAT 4150)\n\nCourse descriptions and prerequisites can be found in the updated course catalog. Registration for these courses will open with general course registration on June 1st.",
		date: "2025-05-10T09:45:00Z",
		categoryId: "cat_1",
		authorId: "auth_2",
		isImportant: false,
	},
];

// Helper functions to work with the mock data

export function getCategoryById(id: string): AnnouncementCategory {
	const category = mockCategories.find(cat => cat.id === id);
	assert(!!category, `Category with id ${id} not found`);
	return category;
}

export function getAuthorById(id: string): Author {
	const author = mockAuthors.find(auth => auth.id === id);
	assert(!!author, `Author with id ${id} not found`);
	return author;
}

// MOCK DATA - Replace with TRPC query
// This would be stored in a user-specific table in the database
export const mockBookmarkedAnnouncements: string[] = ["ann_1", "ann_4", "ann_7"];

export function isAnnouncementBookmarked(id: string): boolean {
	return mockBookmarkedAnnouncements.includes(id);
}