NOTES SAVER - PRODUCTION LEVEL DATA MODELS

## USER MODULE

User

* _id
* name
* email
* password
* role (user/admin)
* profileImage
* bio
* phone
* isBlocked
* isVerified
* bookmarks[]
* notifications[]
* createdAt
* updatedAt

Profile

* userId
* profilePhoto
* bio
* college
* course
* year
* socialLinks

## NOTE MODULE

Note

* _id
* title
* subject
* category
* description
* fileUrl
* thumbnail
* owner
* downloads
* views
* likes
* status
* createdAt
* updatedAt

Category

* _id
* name
* description
* icon

Bookmark

* _id
* userId
* noteId

DownloadHistory

* _id
* userId
* noteId
* downloadedAt

Like

* _id
* userId
* noteId

Comment

* _id
* userId
* noteId
* comment
* createdAt

## SEARCH MODULE

SearchHistory

* _id
* userId
* keyword
* searchedAt

## NOTIFICATION MODULE

Notification

* _id
* userId
* title
* message
* type
* isRead
* createdAt

## REPORT MODULE

Report

* _id
* noteId
* reportedBy
* reason
* status
* createdAt

## ADMIN MODULE

AdminLog

* _id
* adminId
* action
* targetId
* createdAt

UserActivity

* _id
* userId
* activity
* createdAt

## SYSTEM MODULE

SiteSettings

* siteName
* logo
* maxUploadSize
* maintenanceMode

Analytics

* totalUsers
* totalNotes
* totalDownloads
* totalViews
* totalBookmarks

## USER PAGES

Dashboard
Profile
Upload Note
My Notes
All Notes
Bookmarks
Categories
Search
Notifications
Download History
Settings
Help & Support

## ADMIN PAGES

Dashboard
Manage Users
Manage Notes
Categories
Reports
Analytics
Notifications
Storage
Audit Logs
Settings

## DASHBOARD CARDS

USER:

* Total Notes
* Downloads
* Bookmarks
* Recent Activity

ADMIN:

* Total Users
* Active Users
* Blocked Users
* Total Notes
* Total Downloads
* Storage Used
* Recent Registrations
* Recent Uploads
