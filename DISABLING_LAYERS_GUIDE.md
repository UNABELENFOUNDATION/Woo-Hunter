# A Guide to Safely Hiding UI Layers

Hello! This guide is for advanced customization. It will teach you how to safely "disable" or hide different parts of the user interface (UI) that you may not need. This can help you create a simpler, more focused workspace.

**The Golden Rule: "Commenting Out"**

Instead of deleting code (which is risky), we will "comment it out." This tells the application to ignore the code, making the UI element disappear. The code is still there, so you can easily bring the element back by removing the comment.

In this file (`index.tsx`), a comment looks like this:

`{/* This is a comment. Anything between these symbols is hidden. */}`

---

### **Before You Start: A Quick Safety Tip**

Before making any changes, it's a good idea to copy the entire content of the `index.tsx` file and paste it into a temporary text document. This is your backup in case anything goes wrong.

---

### **1. How to Hide the "AI Tool Status" Panel**

This will hide the entire panel on the right side of the main dashboard view (`Hunter View`), giving you more space for the Opportunity Feed.

1.  **Open `index.tsx`**.
2.  Find the `HunterView` component. It looks like this: `const HunterView = ({ ... }) => { ... };`
3.  Inside its `return (...)` statement, find the section for the tool status panel.

**Find this code:**
```jsx
<div className="grid-item tool-status-container">
    <h3>AI Tool Status</h3>
     <ul className="tool-status-list">
        <ToolStatusItem name="Maricopa Permit Bot" status="active" />
        <ToolStatusItem name="Zillow Scraper" status="active" />
        <ToolStatusItem name="Voice Call Analyzer" status="idle" />
        <ToolStatusItem name="Competitor Watch Bot" status="active" />
        <ToolStatusItem name="Social Media Scanner" status="error" />
        <ToolStatusItem name="New Homeowner Bot" status="active" />
    </ul>
</div>
```

**To hide it, wrap it in a comment like this:**
```jsx
{/*
<div className="grid-item tool-status-container">
    <h3>AI Tool Status</h3>
     <ul className="tool-status-list">
        <ToolStatusItem name="Maricopa Permit Bot" status="active" />
        <ToolStatusItem name="Zillow Scraper" status="active" />
        <ToolStatusItem name="Voice Call Analyzer" status="idle" />
        <ToolStatusItem name="Competitor Watch Bot" status="active" />
        <ToolStatusItem name="Social Media Scanner" status="error" />
        <ToolStatusItem name="New Homeowner Bot" status="active" />
    </ul>
</div>
*/}
```
**Result:** The entire right-side panel will disappear.

---

### **2. How to Hide Buttons on Opportunity Cards**

You can hide any action button you don't use.

1.  **Open `index.tsx`**.
2.  Find the `OpportunityCard` component.
3.  Inside its `return (...)` statement, find the button you want to hide.

**Example: Hiding the "Email" button.**

**Find this line:**
```jsx
<button className="action-btn email-btn" onClick={onEmail} disabled={!opportunity.email}>Email</button>
```

**To hide it, wrap it in a comment:**
```jsx
{/* <button className="action-btn email-btn" onClick={onEmail} disabled={!opportunity.email}>Email</button> */}
```

You can do this for any button in the `.opportunity-actions` section, including "Call", "Message", or the entire "Send Flyer" container.

---

### **3. How to Hide the "Generate Daily Briefing" Button**

If you don't use the daily briefing, you can hide the button in the header.

1.  **Open `index.tsx`**.
2.  Find the `Header` component.
3.  Find the button inside the `.header-actions` div.

**Find this code:**
```jsx
{view === 'hunter' && <button className="btn btn-primary" onClick={onGenerateBriefing}>Generate Daily Briefing</button>}
```

**To hide it, wrap it in a comment:**
```jsx
{/* {view === 'hunter' && <button className="btn btn-primary" onClick={onGenerateBriefing}>Generate Daily Briefing</button>} */}
```

---

### **4. How to Hide a Sidebar Section**

You can hide entire sections from the left-side navigation bar.

1.  **Open `index.tsx`**.
2.  Find the `Sidebar` component.

**Example: Hiding the entire "Flyers" section.**

**Find this code block:**
```jsx
<div className="sidebar-section-header">
    <ImageIcon />
    <span>Flyers</span>
</div>
{FLYER_CONFIG.map(({ key, label }) => (
     <a href="#" key={key} className={`nav-item ${currentView === `flyer-${key}` ? 'active' : ''}`} onClick={() => setView(`flyer-${key}` as View)}>
        <span>{label}</span>
    </a>
))}
```

**To hide it, wrap the entire block in a comment:**
```jsx
{/*
<div className="sidebar-section-header">
    <ImageIcon />
    <span>Flyers</span>
</div>
{FLYER_CONFIG.map(({ key, label }) => (
     <a href="#" key={key} className={`nav-item ${currentView === `flyer-${key}` ? 'active' : ''}`} onClick={() => setView(`flyer-${key}` as View)}>
        <span>{label}</span>
    </a>
))}
*/}
```
**Result:** The "Flyers" header and all its links will disappear from the sidebar.

---

### **How to Bring a Layer Back**

To restore any element you've hidden, simply find the comment you added (`{/* ... */}`) and delete the opening `{/*` and the closing `*/}`. The code will become active again, and the UI element will reappear.

Good luck customizing your workspace!