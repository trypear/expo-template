import { db } from "../packages/db/client";
import {
	user,
	course,
	teacher,
	student,
	timetable,
	studentCourse,
	attendance
} from "../packages/db";
import { sql } from "drizzle-orm";

async function main() {
	console.log("🌱 Seeding attendance data...");

	// User ID provided
	const userId = "79db4c0b-7ae6-4173-af02-d0a63e357907";

	// Check if user exists
	const existingUser = await db.query.user.findFirst({
		where: (u) => sql`${u.id} = ${userId}`,
	});

	if (!existingUser) {
		console.error("❌ User not found. Please make sure the user exists in the database.");
		return;
	}

	console.log(`✅ Found user: ${existingUser.name || existingUser.email}`);

	// Create test courses
	const courses = [
		{ name: "Introduction to Computer Science", code: "CS101", description: "Fundamentals of computer science and programming" },
		{ name: "Data Structures and Algorithms", code: "CS201", description: "Advanced data structures and algorithm design" },
		{ name: "Web Development", code: "CS301", description: "Modern web development techniques and frameworks" },
		{ name: "Mobile App Development", code: "CS401", description: "Building native and cross-platform mobile applications" },
	];

	console.log("Creating courses...");
	for (const courseData of courses) {
		await db.insert(course).values(courseData).onConflictDoNothing();
	}

	// Get the created courses
	const createdCourses = await db.query.course.findMany();
	console.log(`✅ Created ${createdCourses.length} courses`);

	// Create teacher record for the user
	console.log("Creating teacher record...");
	await db.insert(teacher).values({
		userId,
		department: "Computer Science",
	}).onConflictDoNothing();

	// Get the teacher record
	const teacherRecord = await db.query.teacher.findFirst({
		where: (t) => sql`${t.userId} = ${userId}`,
	});

	if (!teacherRecord) {
		console.error("❌ Failed to create teacher record");
		return;
	}
	console.log(`✅ Created teacher record with ID: ${teacherRecord.id}`);

	// Create student record for the user (for testing both views)
	console.log("Creating student record...");
	await db.insert(student).values({
		userId,
		studentId: "ST12345",
		enrollmentYear: 2023,
	}).onConflictDoNothing();

	// Get the student record
	const studentRecord = await db.query.student.findFirst({
		where: (s) => sql`${s.userId} = ${userId}`,
	});

	if (!studentRecord) {
		console.error("❌ Failed to create student record");
		return;
	}
	console.log(`✅ Created student record with ID: ${studentRecord.id}`);

	// Create timetable entries for each course
	console.log("Creating timetable entries...");
	const daysOfWeek = [1, 2, 3, 4, 5]; // Monday to Friday
	const startTimes = ["09:00", "11:00", "14:00", "16:00"];
	const endTimes = ["10:30", "12:30", "15:30", "17:30"];
	const locations = ["Room 101", "Room 202", "Lab 301", "Auditorium"];

	const timetableEntries: {
		courseId: string;
		teacherId: string;
		dayOfWeek: number;
		startTime: string;
		endTime: string;
		location: string;
	}[] = [];
	for (let i = 0; i < createdCourses.length; i++) {
		const courseId = createdCourses[i].id;
		const dayOfWeek = daysOfWeek[i % daysOfWeek.length];
		const startTime = startTimes[i % startTimes.length];
		const endTime = endTimes[i % endTimes.length];
		const location = locations[i % locations.length];

		timetableEntries.push({
			courseId,
			teacherId: teacherRecord.id,
			dayOfWeek,
			startTime,
			endTime,
			location,
		});
	}

	for (const entry of timetableEntries) {
		await db.insert(timetable).values(entry).onConflictDoNothing();
	}

	// Get the created timetable entries
	const createdTimetables = await db.query.timetable.findMany();
	console.log(`✅ Created ${createdTimetables.length} timetable entries`);

	// Enroll the student in all courses
	console.log("Enrolling student in courses...");
	for (const course of createdCourses) {
		await db.insert(studentCourse).values({
			studentId: studentRecord.id,
			courseId: course.id,
			enrolledAt: new Date(),
		}).onConflictDoNothing();
	}
	console.log(`✅ Enrolled student in ${createdCourses.length} courses`);

	// Create attendance records for the past 4 weeks
	console.log("Creating attendance records...");
	const statuses = ["present", "absent", "late", "excused"];
	const today = new Date();
	let attendanceCount = 0;

	for (const timetableEntry of createdTimetables) {
		// Create attendance for the past 4 weeks
		for (let weekOffset = 1; weekOffset <= 4; weekOffset++) {
			const date = new Date(today);
			date.setDate(today.getDate() - (weekOffset * 7));

			// Adjust to match the day of week for this timetable entry
			const dayDiff = timetableEntry.dayOfWeek - date.getDay();
			date.setDate(date.getDate() + dayDiff);

			// Format date as YYYY-MM-DD
			const dateStr = date.toISOString().split('T')[0];

			// Random status
			const status = statuses[Math.floor(Math.random() * statuses.length)] as "present" | "absent" | "late" | "excused";

			await db.insert(attendance).values({
				studentId: studentRecord.id,
				timetableId: timetableEntry.id,
				date: dateStr,
				status,
				notes: status === "absent" ? "Student was absent" :
					status === "late" ? "Student arrived 10 minutes late" :
						status === "excused" ? "Medical appointment" : null,
				recordedBy: userId,
				recordedAt: new Date(),
			}).onConflictDoNothing();

			attendanceCount++;
		}
	}

	console.log(`✅ Created ${attendanceCount} attendance records`);
	console.log("✅ Seeding completed successfully!");
}

main()
	.catch((e) => {
		console.error("❌ Error seeding data:");
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		console.log("🔄 Disconnecting from database...");
		process.exit(0);
	});