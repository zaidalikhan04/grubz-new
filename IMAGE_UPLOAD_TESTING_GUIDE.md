# 🧪 Image Upload Testing Guide

## 🔧 **What I Fixed:**

### **✅ Menu Item Images:**
- Updated `MyRestaurant.tsx` to use alternative upload service
- Updated `MenuItemForm.tsx` to use alternative upload service  
- Images are now properly saved to Firestore with the menu item data
- **Field used:** `imageUrl` in menu item documents

### **✅ Profile Pictures:**
- Updated `ProfileSection.tsx` to use alternative upload service
- Updated `UserProfile.tsx` to use alternative upload service
- Updated `CustomerProfile.tsx` with alternative upload option
- **Field used:** `profilePhoto` in user documents

---

## 🧪 **Testing Steps:**

### **Test 1: Menu Item Images**

1. **Go to:** http://localhost:5176/
2. **Login** with your restaurant account
3. **Navigate to:** Restaurant Dashboard → My Restaurant
4. **Click:** "Add New Item" button
5. **Fill in:** Name, Description, Price, Category
6. **Upload Image:** Click the "Dish Photo" upload area
7. **Select:** A small image (< 800KB for immediate Base64 upload)
8. **Save:** Click "Add Menu Item"
9. **Verify:** 
   - Check browser console for success messages
   - Image should appear in the menu item list
   - Image should be saved in Firestore

### **Test 2: Profile Pictures**

#### **Option A: Profile Section**
1. **Go to:** Profile section in your dashboard
2. **Click:** Profile picture upload area
3. **Select:** A small image (< 800KB)
4. **Verify:** Image updates immediately

#### **Option B: Customer Profile**
1. **Go to:** Customer Dashboard → Profile
2. **Click:** "Change Photo (Alternative)" button
3. **Select:** A small image
4. **Verify:** Profile picture updates

#### **Option C: User Profile**
1. **Go to:** User Profile page
2. **Use:** The profile photo upload
3. **Verify:** Updates work

---

## 🔍 **What to Look For:**

### **✅ Success Indicators:**
- Console shows: `✅ Upload successful via base64` (or imgbb)
- Console shows: `✅ Menu item added successfully` 
- Console shows: `✅ Profile picture updated successfully`
- Images appear immediately in the UI
- No CORS errors in console

### **❌ Failure Indicators:**
- Console shows: `❌ Upload failed`
- CORS errors (shouldn't happen with alternative service)
- Images don't appear after upload
- Error messages in UI

---

## 📊 **File Size Guidelines:**

| File Size | Upload Method | Speed | Notes |
|-----------|---------------|-------|-------|
| < 800KB | Base64 | Instant | Works immediately |
| 800KB - 5MB | ImgBB* | Fast | Needs API key setup |
| > 5MB | Not supported | - | Compress image first |

*ImgBB requires free API key from https://api.imgbb.com/

---

## 🐛 **Troubleshooting:**

### **"Upload failed" Error:**
1. Check file size (< 800KB for Base64)
2. Check file format (JPG, PNG, WebP only)
3. Check internet connection
4. Try a different/smaller image

### **Image Not Saving to Database:**
1. Check browser console for Firestore errors
2. Verify user authentication
3. Check Firestore rules allow writes

### **Image Not Displaying:**
1. Check if `imageUrl` field exists in Firestore document
2. Verify image URL is valid
3. Check browser network tab for image loading errors

---

## 🔧 **Database Structure:**

### **Menu Items:**
```
restaurants/{userId}/menu/{itemId}
{
  name: "Pizza",
  description: "Delicious pizza",
  price: 12.99,
  category: "Main Course",
  imageUrl: "data:image/jpeg;base64,..." // or external URL
  // ... other fields
}
```

### **User Profiles:**
```
users/{userId}
{
  name: "John Doe",
  email: "john@example.com",
  profilePhoto: "data:image/jpeg;base64,..." // or external URL
  // ... other fields
}
```

---

## 🚀 **Next Steps:**

1. **Test both menu items and profile pictures**
2. **Check console for success/error messages**
3. **Verify images are saved in Firestore**
4. **If needed, setup ImgBB for larger files**

The alternative upload service should work immediately for small files using Base64 encoding! 🎉
