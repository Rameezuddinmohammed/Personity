# Personity Component Specifications

## Detailed Component Implementations

This document provides exact specifications for implementing each component with pixel-perfect precision.

---

## 1. Authentication Pages

### Login Page

**Layout:**
```
Viewport: Full height, centered
Container: 440px width, centered vertically and horizontally
Background: N50 (full viewport)
```

**Card:**
```css
background: white
border-radius: 16px
padding: 48px
box-shadow: 0 1px 3px rgba(0,0,0,0.04)
```

**Logo:**
```css
height: 32px
margin-bottom: 32px
text-align: center
```

**Heading:**
```css
font-size: 24px
font-weight: 600
color: N950
letter-spacing: -0.01em
margin-bottom: 8px
text-align: center
```

**Subheading:**
```css
font-size: 14px
color: N600
margin-bottom: 32px
text-align: center
```

**Form:**
```css
display: flex
flex-direction: column
gap: 20px
```

**Input Group:**
```css
Label:
  font-size: 13px
  font-weight: 500
  color: N700
  margin-bottom: 8px
  display: block

Input:
  width: 100%
  padding: 12px 16px
  font-size: 14px
  color: N950
  background: white
  border: 1px solid N300
  border-radius: 8px
  transition: all 150ms ease
  
  &:hover {
    border-color: N400
  }
  
  &:focus {
    outline: none
    border-color: #2563EB
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2)
  }
  
  &::placeholder {
    color: N400
  }
```

**Submit Button:**
```css
width: 100%
padding: 12px 24px
font-size: 14px
font-weight: 500
color: white
background: #2563EB
border: none
border-radius: 8px
cursor: pointer
transition: all 150ms ease

&:hover {
  background: #1D4ED8
}

&:active {
  transform: scale(0.98)
}

&:disabled {
  background: N300
  color: N500
  cursor: not-allowed
}
```

**Divider:**
```css
display: flex
align-items: center
margin: 24px 0
color: N500
font-size: 13px

&::before, &::after {
  content: ''
  flex: 1
  height: 1px
  background: N200
}

&::before {
  margin-right: 16px
}

&::after {
  margin-left: 16px
}
```

**Google OAuth Button:**
```css
width: 100%
padding: 12px 24px
font-size: 14px
font-weight: 500
color: N950
background: white
border: 1px solid N300
border-radius: 8px
cursor: pointer
transition: all 150ms ease
display: flex
align-items: center
justify-content: center
gap: 12px

&:hover {
  border-color: N400
  background: N50
}

Icon:
  width: 20px
  height: 20px
```

**Footer Link:**
```css
margin-top: 24px
text-align: center
font-size: 14px
color: N600

Link:
  color: #2563EB
  text-decoration: none
  font-weight: 500
  
  &:hover {
    text-decoration: underline
  }
```

---

## 2. Dashboard Layout

### Top Navigation

**Container:**
```css
position: sticky
top: 0
z-index: 50
height: 64px
background: white
border-bottom: 1px solid N200
padding: 0 40px
display: flex
align-items: center
justify-content: space-between
```

**Logo Section:**
```css
display: flex
align-items: center
gap: 32px

Logo:
  height: 24px
  
Nav Links:
  display: flex
  gap: 4px
  
  Link:
    padding: 8px 16px
    font-size: 14px
    font-weight: 500
    color: N700
    border-radius: 6px
    transition: all 150ms ease
    text-decoration: none
    
    &:hover {
      background: N100
    }
    
    &.active {
      background: N200
      color: N950
    }
```

**Right Section:**
```css
display: flex
align-items: center
gap: 16px

User Menu:
  display: flex
  align-items: center
  gap: 12px
  padding: 6px 12px 6px 6px
  border-radius: 8px
  cursor: pointer
  transition: all 150ms ease
  
  &:hover {
    background: N100
  }
  
  Avatar:
    width: 32px
    height: 32px
    border-radius: 50%
    background: N200
    display: flex
    align-items: center
    justify-content: center
    font-size: 14px
    font-weight: 500
    color: N700
  
  Name:
    font-size: 14px
    font-weight: 500
    color: N950
  
  Chevron:
    width: 16px
    height: 16px
    color: N500
```

### Sidebar Navigation

**Container:**
```css
position: fixed
left: 0
top: 64px
width: 240px
height: calc(100vh - 64px)
background: white
border-right: 1px solid N200
padding: 24px 16px
overflow-y: auto
```

**Section:**
```css
margin-bottom: 24px

Label:
  font-size: 11px
  font-weight: 500
  color: N500
  text-transform: uppercase
  letter-spacing: 0.05em
  margin: 0 0 8px 12px
```

**Nav Item:**
```css
display: flex
align-items: center
gap: 12px
padding: 10px 12px
font-size: 14px
font-weight: 500
color: N700
border-radius: 8px
cursor: pointer
transition: all 150ms ease
text-decoration: none
margin-bottom: 2px

Icon:
  width: 20px
  height: 20px
  color: N500

&:hover {
  background: N100
}

&.active {
  background: rgba(37, 99, 235, 0.1)
  color: #2563EB
  
  Icon {
    color: #2563EB
  }
}
```

### Main Content Area

**Container:**
```css
margin-left: 240px
margin-top: 64px
min-height: calc(100vh - 64px)
background: N50
padding: 40px
```

**Page Header:**
```css
display: flex
align-items: center
justify-content: space-between
margin-bottom: 32px

Title:
  font-size: 24px
  font-weight: 600
  color: N950
  letter-spacing: -0.01em

Actions:
  display: flex
  gap: 12px
```

---

## 3. Survey Creation Wizard

### Wizard Container

**Layout:**
```css
max-width: 800px
margin: 0 auto
padding: 40px 0
```

**Card:**
```css
background: white
border-radius: 16px
padding: 48px
box-shadow: 0 1px 3px rgba(0,0,0,0.04)
```

### Progress Indicator

**Container:**
```css
display: flex
align-items: center
justify-content: space-between
margin-bottom: 48px
position: relative
```

**Step:**
```css
display: flex
flex-direction: column
align-items: center
gap: 8px
position: relative
z-index: 2

Circle:
  width: 40px
  height: 40px
  border-radius: 50%
  display: flex
  align-items: center
  justify-content: center
  font-size: 14px
  font-weight: 600
  transition: all 200ms ease
  
  &.completed {
    background: #059669
    color: white
  }
  
  &.active {
    background: #2563EB
    color: white
    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.2)
  }
  
  &.upcoming {
    background: N200
    color: N500
  }

Label:
  font-size: 13px
  font-weight: 500
  color: N700
  
  &.active {
    color: #2563EB
  }
  
  &.upcoming {
    color: N500
  }
```

**Connector Line:**
```css
position: absolute
top: 20px
left: 0
right: 0
height: 2px
background: N200
z-index: 1

Progress:
  height: 100%
  background: #2563EB
  transition: width 300ms ease
```

### Form Step

**Step Header:**
```css
margin-bottom: 32px

Title:
  font-size: 20px
  font-weight: 600
  color: N950
  margin-bottom: 8px

Description:
  font-size: 14px
  color: N600
  line-height: 1.5
```

**Form Fields:**
```css
display: flex
flex-direction: column
gap: 24px
margin-bottom: 40px
```

**Textarea (for objective):**
```css
width: 100%
min-height: 120px
padding: 16px
font-size: 14px
color: N950
background: white
border: 1px solid N300
border-radius: 8px
resize: vertical
font-family: inherit
line-height: 1.5
transition: all 150ms ease

&:hover {
  border-color: N400
}

&:focus {
  outline: none
  border-color: #2563EB
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2)
}

&::placeholder {
  color: N400
}
```

**Topics List:**
```css
display: flex
flex-direction: column
gap: 12px

Topic Item:
  display: flex
  align-items: center
  gap: 12px
  
  Input:
    flex: 1
    padding: 12px 16px
    font-size: 14px
    color: N950
    background: white
    border: 1px solid N300
    border-radius: 8px
  
  Remove Button:
    width: 36px
    height: 36px
    display: flex
    align-items: center
    justify-content: center
    border-radius: 6px
    color: N500
    cursor: pointer
    transition: all 150ms ease
    
    &:hover {
      background: N100
      color: #DC2626
    }

Add Button:
  align-self: flex-start
  padding: 8px 16px
  font-size: 13px
  font-weight: 500
  color: #2563EB
  background: transparent
  border: 1px dashed N300
  border-radius: 8px
  cursor: pointer
  transition: all 150ms ease
  
  &:hover {
    border-color: #2563EB
    background: rgba(37, 99, 235, 0.05)
  }
```

**Settings Grid:**
```css
display: grid
grid-template-columns: repeat(2, 1fr)
gap: 24px

@media (max-width: 640px) {
  grid-template-columns: 1fr
}
```

**Select Field:**
```css
Label:
  font-size: 13px
  font-weight: 500
  color: N700
  margin-bottom: 8px
  display: block

Select:
  width: 100%
  padding: 12px 16px
  font-size: 14px
  color: N950
  background: white
  border: 1px solid N300
  border-radius: 8px
  cursor: pointer
  appearance: none
  background-image: url("data:image/svg+xml,...")
  background-repeat: no-repeat
  background-position: right 12px center
  background-size: 16px
  
  &:hover {
    border-color: N400
  }
  
  &:focus {
    outline: none
    border-color: #2563EB
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2)
  }
```

### Navigation Footer

**Container:**
```css
display: flex
justify-content: space-between
align-items: center
padding-top: 32px
border-top: 1px solid N200
```

**Button Group:**
```css
display: flex
gap: 12px
```

---

## 4. Conversation Interface (Respondent)

### Page Layout

**Container:**
```css
min-height: 100vh
background: N50
display: flex
flex-direction: column
```

**Header:**
```css
padding: 24px 40px
background: white
border-bottom: 1px solid N200

Logo:
  height: 20px
  margin-bottom: 16px

Progress Bar:
  height: 4px
  background: N200
  border-radius: 2px
  overflow: hidden
  
  Fill:
    height: 100%
    background: #2563EB
    transition: width 300ms ease
```

**Chat Container:**
```css
flex: 1
max-width: 800px
width: 100%
margin: 0 auto
padding: 40px 24px
display: flex
flex-direction: column
```

**Messages Area:**
```css
flex: 1
background: white
border-radius: 16px
padding: 32px
overflow-y: auto
box-shadow: 0 1px 3px rgba(0,0,0,0.04)
display: flex
flex-direction: column
gap: 16px
```

### Message Bubbles

**AI Message:**
```css
align-self: flex-start
max-width: 80%
padding: 12px 16px
background: N100
border-radius: 12px
border-bottom-left-radius: 4px
font-size: 14px
line-height: 1.5
color: N950

Avatar:
  width: 32px
  height: 32px
  border-radius: 50%
  background: #2563EB
  display: flex
  align-items: center
  justify-content: center
  margin-bottom: 8px
  
  Icon:
    width: 18px
    height: 18px
    color: white
```

**User Message:**
```css
align-self: flex-end
max-width: 80%
padding: 12px 16px
background: rgba(37, 99, 235, 0.1)
border-radius: 12px
border-bottom-right-radius: 4px
font-size: 14px
line-height: 1.5
color: N950
```

**Typing Indicator:**
```css
align-self: flex-start
padding: 12px 16px
background: N100
border-radius: 12px
border-bottom-left-radius: 4px
display: flex
gap: 4px

Dot:
  width: 8px
  height: 8px
  border-radius: 50%
  background: N400
  animation: bounce 1.4s infinite ease-in-out
  
  &:nth-child(1) {
    animation-delay: -0.32s
  }
  
  &:nth-child(2) {
    animation-delay: -0.16s
  }

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0)
  }
  40% {
    transform: scale(1)
  }
}
```

### Input Area

**Container:**
```css
position: sticky
bottom: 0
background: white
border-top: 1px solid N200
padding: 24px
```

**Input Group:**
```css
max-width: 800px
margin: 0 auto
display: flex
gap: 12px
align-items: flex-end

Textarea:
  flex: 1
  min-height: 48px
  max-height: 120px
  padding: 12px 16px
  font-size: 14px
  color: N950
  background: white
  border: 1px solid N300
  border-radius: 12px
  resize: none
  font-family: inherit
  line-height: 1.5
  
  &:focus {
    outline: none
    border-color: #2563EB
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2)
  }

Send Button:
  width: 48px
  height: 48px
  display: flex
  align-items: center
  justify-content: center
  background: #2563EB
  border: none
  border-radius: 12px
  cursor: pointer
  transition: all 150ms ease
  flex-shrink: 0
  
  &:hover {
    background: #1D4ED8
  }
  
  &:active {
    transform: scale(0.95)
  }
  
  &:disabled {
    background: N300
    cursor: not-allowed
  }
  
  Icon:
    width: 20px
    height: 20px
    color: white
```

---

## 5. Insights Dashboard

### Layout

**Container:**
```css
display: grid
grid-template-columns: 320px 1fr
gap: 40px
padding: 40px

@media (max-width: 1024px) {
  grid-template-columns: 1fr
}
```

### Sidebar (Summary)

**Container:**
```css
position: sticky
top: 104px
height: fit-content
display: flex
flex-direction: column
gap: 24px
```

**Summary Card:**
```css
background: white
border: 1px solid N200
border-radius: 12px
padding: 24px

Title:
  font-size: 13px
  font-weight: 500
  color: N500
  text-transform: uppercase
  letter-spacing: 0.05em
  margin-bottom: 16px

Content:
  font-size: 14px
  line-height: 1.6
  color: N700
```

**Metrics Card:**
```css
background: white
border: 1px solid N200
border-radius: 12px
padding: 24px
display: flex
flex-direction: column
gap: 16px

Metric:
  Label:
    font-size: 13px
    font-weight: 500
    color: N500
    margin-bottom: 4px
  
  Value:
    font-size: 24px
    font-weight: 600
    color: N950
    letter-spacing: -0.01em
```

**Export Buttons:**
```css
display: flex
flex-direction: column
gap: 8px

Button:
  width: 100%
  padding: 12px 16px
  font-size: 14px
  font-weight: 500
  color: N950
  background: white
  border: 1px solid N300
  border-radius: 8px
  cursor: pointer
  transition: all 150ms ease
  display: flex
  align-items: center
  justify-content: center
  gap: 8px
  
  &:hover {
    border-color: N400
    background: N50
  }
  
  Icon:
    width: 16px
    height: 16px
    color: N500
```

### Main Area

**Section:**
```css
margin-bottom: 48px

Header:
  display: flex
  align-items: center
  justify-content: space-between
  margin-bottom: 24px
  
  Title:
    font-size: 20px
    font-weight: 600
    color: N950
  
  Count:
    font-size: 14px
    color: N500
```

**Themes Grid:**
```css
display: grid
grid-template-columns: repeat(auto-fill, minmax(300px, 1fr))
gap: 24px
```

**Theme Card:**
```css
background: white
border: 1px solid N200
border-radius: 12px
padding: 24px
transition: all 150ms ease

&:hover {
  border-color: N300
  transform: translateY(-2px)
}

Header:
  display: flex
  align-items: flex-start
  justify-content: space-between
  margin-bottom: 16px
  
  Theme Name:
    font-size: 16px
    font-weight: 600
    color: N950
  
  Frequency:
    font-size: 20px
    font-weight: 600
    color: #2563EB

Description:
  font-size: 13px
  line-height: 1.5
  color: N600
  margin-bottom: 16px

Quotes:
  padding: 12px
  background: N50
  border-radius: 8px
  border-left: 3px solid #2563EB
  
  Quote:
    font-size: 13px
    line-height: 1.5
    color: N700
    font-style: italic
    margin-bottom: 8px
    
    &:last-child {
      margin-bottom: 0
    }
```

**Responses List:**
```css
background: white
border: 1px solid N200
border-radius: 12px
overflow: hidden
```

**Response Item:**
```css
padding: 20px 24px
border-bottom: 1px solid N100
cursor: pointer
transition: all 150ms ease

&:hover {
  background: N50
}

&:last-child {
  border-bottom: none
}

Header:
  display: flex
  align-items: center
  justify-content: space-between
  margin-bottom: 8px
  
  Date:
    font-size: 13px
    color: N500
  
  Quality Badge:
    padding: 4px 8px
    font-size: 12px
    font-weight: 500
    border-radius: 4px
    
    &.high {
      background: rgba(5, 150, 105, 0.1)
      color: #059669
    }
    
    &.medium {
      background: rgba(217, 119, 6, 0.1)
      color: #D97706
    }
    
    &.low {
      background: rgba(220, 38, 38, 0.1)
      color: #DC2626
    }

Summary:
  font-size: 14px
  line-height: 1.5
  color: N700
  margin-bottom: 12px

Tags:
  display: flex
  flex-wrap: wrap
  gap: 8px
  
  Tag:
    padding: 4px 10px
    font-size: 12px
    font-weight: 500
    color: N700
    background: N100
    border-radius: 6px
```

---

## 6. Empty States

**Container:**
```css
display: flex
flex-direction: column
align-items: center
justify-content: center
padding: 64px 24px
text-align: center
```

**Icon:**
```css
width: 64px
height: 64px
color: N300
margin-bottom: 24px
```

**Title:**
```css
font-size: 18px
font-weight: 600
color: N950
margin-bottom: 8px
```

**Description:**
```css
font-size: 14px
color: N600
max-width: 400px
margin-bottom: 24px
line-height: 1.5
```

**Action Button:**
```css
padding: 12px 24px
font-size: 14px
font-weight: 500
color: white
background: #2563EB
border: none
border-radius: 8px
cursor: pointer
transition: all 150ms ease

&:hover {
  background: #1D4ED8
}
```

---

## 7. Loading States

**Page Skeleton:**
```css
Container:
  padding: 40px
  
Header Skeleton:
  height: 32px
  width: 200px
  background: N200
  border-radius: 8px
  margin-bottom: 32px
  animation: pulse 1.5s ease-in-out infinite

Card Skeleton:
  background: white
  border: 1px solid N200
  border-radius: 12px
  padding: 24px
  
  Line:
    height: 16px
    background: N200
    border-radius: 4px
    margin-bottom: 12px
    animation: pulse 1.5s ease-in-out infinite
    
    &:nth-child(1) {
      width: 60%
    }
    
    &:nth-child(2) {
      width: 80%
    }
    
    &:nth-child(3) {
      width: 40%
    }
```

---

This component specification provides exact measurements, colors, and behaviors for every UI element. Implement these precisely for a premium, cohesive interface.
