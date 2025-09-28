# A Simple Guide to Safely Updating Your App

Hello! This guide is designed to help you make common changes to your Woo Hunter app without needing to be a developer. By following these instructions, you can keep your lead list fresh and tweak the app's appearance safely.

---

### **Understanding the Files**

Your app is made of three main files:
- **`index.tsx`**: This is the "brain" of your application. It contains the logic and the list of your leads.
- **`index.css`**: This is the "style guide." It controls all the colors, fonts, and the overall look of the app.
- **`index.html`**: This is the "skeleton." You will rarely, if ever, need to touch this file.

---

### **How to Safely Add, Edit, or Remove Leads**

This is the most common and safest change you will make. Your current list of leads is stored directly in the `index.tsx` file.

1.  **Open `index.tsx`**.
2.  Scroll down until you find the section that starts with `const initialOpportunityData`. This is your lead "database."
3.  You will see a list of leads, where each lead looks like this:

    ```javascript
    // This is a single lead object.
    {
        id: 1, // A unique number for this lead
        phone: '555-123-4567', // The lead's phone number
        email: 'permits@example.com', // The lead's email (optional)
        category: 'Bath', // Must be 'Windows', 'Bath', 'Roof', or 'Siding'
        type: 'Building Permit', // The kind of lead
        source: 'Maricopa County Bot', // Where the lead came from
        details: 'Bathroom remodel permit at 123 E Main St, Mesa. Home built 1998.', // A description
        stealth: 95, // A score from 0-100
        status: 'New' // The current status, e.g., 'New', 'Contacted'
    },
    // The next lead starts here...
    ```

*   **To Edit a Lead:** Simply change the text inside the quotes (`''`) for any field.
*   **To Add a New Lead:** Carefully copy an entire lead object (from the opening `{` to the closing `},`) and paste it at the end of the list (before the closing `];`). **Remember to change the `id` to a new, unique number!**
*   **To Remove a Lead:** Delete the entire lead object, from `{` to `},`.

---

### **How to Easily Change Colors**

You can change the entire color scheme of the app in one place.

1.  **Open `index.css`**.
2.  At the very top, you'll see a section that starts with `:root { ... }`. These are your app's global color variables.
3.  To change a color, simply replace the six-digit color code (e.g., `#3B82F6`).

    **Key Colors to Change:**
    *   `--bg-primary: #111827;` (The main dark background)
    *   `--bg-secondary: #1F2937;` (The background of cards and the sidebar)
    *   `--text-primary: #F9FAFB;` (The main text color)
    *   `--accent-blue: #3B82F6;` (The main button and highlight color)
    *   `--accent-green: #10B981;` (The color for "Call" buttons and positive stats)

    You can find new color codes using a free online tool like [Google Color Picker](https://www.google.com/search?q=color+picker).

---

### **How to Change Text Labels**

If you want to change the text on a button or a header:

1.  **Open `index.tsx`**.
2.  Look for the component you want to change. For example, to change the main header, find the `Header` component.
3.  Inside its `return (...)` statement, you'll see the text.

    For example, to change "Live Customer Hunter":
    ```javascript
    // Find this line in the Header component
    <h2>{view === 'hunter' ? 'Live Customer Hunter' : 'Performance Analytics'}</h2>

    // Change it to
    <h2>{view === 'hunter' ? 'My Awesome Lead Finder' : 'Performance Analytics'}</h2>
    ```

---

### **⚠️ A Friendly Warning: The "Engine Room"**

Think of this app like a car. The changes above are like changing the radio station, adjusting the mirrors, or getting a new paint job—they are safe and easy to do.

However, parts of the `index.tsx` file are like the car's engine. Changing code inside functions, anything that starts with `const [`, or the structure of the HTML-like code (JSX) can cause the app to break.

**Our advice:** Stick to editing the "safe zones" described in this guide. If you need a more complex feature or change, it's best to ask for it.

Happy hunting!