# University Announcements App

A mobile application for university announcements with category filtering, bookmarking, search functionality, and an admin interface.

## Features

### For Students/Users

- **Browse Announcements**: View a list of all university announcements
- **Filter by Category**: Filter announcements by categories like Academic, Events, Administrative, etc.
- **Save Announcements**: Bookmark important announcements for quick access
- **Search**: Search for specific announcements by keywords
- **View Details**: See full announcement details including attachments
- **Important Notifications**: Easily identify important announcements

### For Administrators

- **Create Announcements**: Add new announcements with rich content
- **Categorize**: Assign categories to announcements
- **Mark as Important**: Flag critical announcements
- **Attach Files**: Add PDF, DOC, or image attachments to announcements
- **Manage Authors**: Select announcement authors

## Screens

### Main Announcements Screen

- Displays a list of all announcements
- Features category filters at the top
- Includes a search bar for finding specific announcements
- Shows a "Saved" filter to view bookmarked announcements
- Each announcement card shows:
  - Title
  - Category
  - Brief content preview
  - Author
  - Date
  - Important badge (if applicable)
  - Attachment indicator (if applicable)
  - Bookmark button

### Announcement Detail Screen

- Shows the full announcement content
- Displays metadata (author, date, category)
- Lists all attachments with download options
- Includes a bookmark button

### Admin Screen

- Form for creating new announcements
- Fields for title, content, category, and author
- Toggle for marking announcements as important
- Interface for adding attachments

## Implementation Notes

### Current Status

- The UI is fully implemented with mock data
- All screens and components are created and styled
- Navigation between screens is working

### Next Steps for Integration

- Replace mock data with actual TRPC queries and mutations
- Implement authentication for admin functionality
- Set up file upload for attachments
- Add proper error handling and loading states

### Database and API Requirements

See the `ANNOUNCEMENTS_API_REQUIREMENTS.md` file for detailed information about:

- Database schema requirements
- TRPC endpoint specifications
- Integration notes

## Usage

### For Users

1. Browse the main announcements screen to see all announcements
2. Use the category filters to narrow down announcements
3. Tap the "Save" button on any announcement to bookmark it
4. Use the "Saved" filter to view your bookmarked announcements
5. Tap on any announcement to view its full details
6. Use the search bar to find specific announcements

### For Administrators

1. Navigate to the Settings tab
2. Tap on "Manage Announcements" in the Admin section
3. Fill out the form to create a new announcement
4. Add attachments if needed
5. Tap "Create Announcement" to publish

## UI Components

The app uses the following custom components:

- `AnnouncementCard`: Displays a summary of an announcement
- `BookmarkButton`: Toggle button for saving/unsaving announcements
- `ThemedText` and `ThemedView`: Theme-aware components for consistent styling
- Various form components in the admin interface

## Styling

The app follows a consistent design language with:

- Clean, minimal UI
- Clear typography hierarchy
- Visual indicators for important items
- Consistent spacing and padding
- Responsive layout that works on different screen sizes
- Support for both light and dark themes

## Future Enhancements

Potential future improvements include:

- Push notifications for important announcements
- Comment functionality for discussions
- Rich text formatting for announcement content
- Analytics for tracking announcement engagement
- Bulk announcement management for administrators
- Scheduled announcements with future publish dates
