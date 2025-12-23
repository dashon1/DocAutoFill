# DocAutofill Investor Pitch Deck - Design Specification

**Style**: Minimalist (Dieter Rams inspired)
**Viewport**: 1280x720px (Fixed)
**Theme**: "Less is More" with Professional Blue Accent

---

## 1. Direction & Rationale

**Visual Essence:**
A rigorous, high-clarity minimalist aesthetic inspired by Dieter Rams and modern SaaS leaders (Linear, Stripe, Apple). The design uses maximum whitespace (60%+) and a single strategic accent color (#8BAFD0) to convey "AI-native intelligence" and "Developer-first precision."

**Rationale:**
*   **Clarity for Complexity**: Document automation is complex; the design must be radically simple to prevent cognitive load.
*   **Developer Appeal**: The "clean code" philosophy mirrors the visual design—no clutter, efficient, structured.
*   **Investor Focus**: High-contrast data and large typography force focus on key metrics ($8.7B market, 282% ROI) without distraction.

**Key Characteristics:**
*   **Radical Whitespace**: 60-70% of every slide is empty space.
*   **Single Accent**: "Professional Blue" (#8BAFD0) used *only* for primary actions and key data.
*   **Grid Precision**: All elements align to a strict 8px grid.
*   **No Decorations**: No background blobs, waves, or decorative gradients.

---

## 2. Slide Templates (Visual Structures)

**⚠️ Content Density Rule**: 
*   **Max 7 lines of text** per slide. 
*   **Pagination Mandatory**: If content exceeds 7 lines (e.g., Market Analysis detailed tables), you MUST split into "Part 1" and "Part 2" slides.
*   **Data Strategy**: Do not cram complex tables. Extract the *single most important number* (80px) and use a simplified chart or list for context.

### Template 1: Title / Hero
**Purpose**: Opening impression.
**Layout**: Centered or 40/60 Asymmetric.
**Visuals**: 
*   **Headline**: 64-72px Bold, centered or left-aligned.
*   **Subhead**: 28px Regular, max 2 lines.
*   **Accent**: Small 4px horizontal line (80px width) above title in Professional Blue.
*   **Space**: Massive whitespace. No background images.
*   **Logo**: Small (32px height), top-left corner (60px margin).

### Template 2: Core Statement (Problem/Solution)
**Purpose**: Defining the "Why" and "What".
**Layout**: Two-column (40% Text / 60% Visual) OR Centered Big Statement.
**Visuals**:
*   **Heading**: 48px Bold.
*   **Body**: 24px Regular. Max 5 lines.
*   **Visual**: A single, high-quality interface screenshot or abstract geometric diagram (thin lines).
*   **Styling**: Images use distinct "Product Shadow" (0px 8px 24px rgba(0,0,0,0.08)).

### Template 3: Market Data (The Big Number)
**Purpose**: Showing the $8.7B opportunity.
**Layout**: Focused asymmetric (Left text, Right data).
**Visuals**:
*   **Key Number**: **96px Bold** in Professional Blue (#8BAFD0).
*   **Label**: 24px Uppercase tracking-wide (0.05em).
*   **Context**: Small bar chart (simple bars, no grid lines) or brief list.
*   **Pagination**: If showing CAGR + SAM + TAM + Trends, split into 2 slides.

### Template 4: Product Demo (Browser Frame)
**Purpose**: Showing the tool in action.
**Layout**: Full-width content container (1040px max).
**Visuals**:
*   **Container**: A clean, minimal "Browser Window" frame (grey header, traffic lights).
*   **Content**: High-fidelity UI screenshot.
*   **Caption**: 18px text below image, centered.
*   **Animation**: "Scroll" effect (slide up inside mask) or simple fade.

### Template 5: Comparison (Clean Table)
**Purpose**: Us vs. Them (DocuSign/Adobe).
**Layout**: Simple grid.
**Visuals**:
*   **Rows**: 64px height, 1px solid border-bottom (#E0E0E0).
*   **Columns**: Text left-aligned. "Us" column highlighted with subtle blue background (#F0F7FF).
*   **Icons**: Simple checkmarks (Blue) and dashes (Gray). NO red crosses (too aggressive).
*   **Typography**: Header 20px Bold, Body 20px Regular.

### Template 6: Team (Grid)
**Purpose**: Who we are.
**Layout**: 3 or 4 columns.
**Visuals**:
*   **Photo**: Grayscale or desaturated, circular or square with 0px radius.
*   **Name**: 24px Bold.
*   **Role**: 18px Regular (Gray).
*   **Bio**: NONE. Or max 1 line "Ex-Stripe".
*   **Spacing**: 40px gaps between columns.

### Template 7: Quote / Social Proof
**Purpose**: Trust.
**Layout**: Centered.
**Visuals**:
*   **Text**: 36px Medium, italic.
*   **Mark**: Large opening quote mark (120px) in very light gray (#F5F5F5) behind text.
*   **Author**: 20px Bold + Company Logo (small).

### Template 8: Closing / Ask
**Purpose**: The funding ask.
**Layout**: Centered.
**Visuals**:
*   **Number**: "$2M" (or ask amount) in 80px Blue.
*   **Terms**: 24px text below.
*   **Contact**: Simple block (Name | Email | Website) - 20px text, 32px icons.

---

## 3. Visual Guidelines

**Images & Sourcing**:
*   **Style**: Minimalist, high-key (bright), desaturated or B&W.
*   **Content**:
    *   **Hero/Background**: None. Pure white.
    *   **Content Images**: Clean UI mocks (use the "Browser Frame" wrapper), abstract geometric line art (thin stroke), or simple office photography (Apple style).
    *   **NO**: Stock photos of shaking hands, complex 3D renders, busy illustrations.

**Icons**:
*   **Set**: Lucide or Heroicons (Outline style).
*   **Size**: 32px (standard), 64px (feature highlight).
*   **Stroke**: 2px.
*   **Color**: #212121 (Primary) or #8BAFD0 (Accent).
*   **NO Emojis**: Strictly forbidden.

**Charts & Data**:
*   **Style**: "Data-Ink Ratio" optimization. Remove grid lines, axis lines, and background fills.
*   **Colors**: Bars in Blue (#8BAFD0), labels in Gray (#616161).
*   **Donuts**: Thin stroke (20px), center number large.

**Typography Decorations**:
*   **Line**: A signature 4px blue line (80px wide) used to separate Headings from Body.
*   **Numbers**: Numbered lists use large (32px) blue numbers.

**Animation (CSS)**:
*   **Entrance**: `fade-in-up` (0.6s ease-out).
*   **Stagger**: Elements appear sequentially (100ms delay).
*   **Hover**: Buttons `transform: translateY(-2px)` and subtle shadow increase.
*   **Transition**: Smooth fade between slides.

---

## 4. Implementation Restrictions

**MANDATORY for Build Agent**:
1.  **NO Emojis**: Use `<svg>` icons only.
2.  **NO Placeholders**: Do not use "Lorem Ipsum". Use the structure descriptions to place real content provided in the prompt.
3.  **NO Real Personal Data**: If the source text contains real emails/phone numbers, obfuscate them (e.g., `founders@docautofill.com`).
4.  **Pagination**: If a section (like Market Analysis) has >7 bullets or a massive table, **STOP**. Create "Market Analysis (1/2)" and "(2/2)".
5.  **Contrast**: Text #212121 on White #FFFFFF. Accent #8BAFD0.
6.  **Font**: Use 'Inter' or 'Helvetica Neue' from Google Fonts/System.

**FORBIDDEN**:
*   Gradient backgrounds.
*   Text smaller than 14px (Caption) or 22px (Body).
*   More than 1 image per slide (unless Team grid).
