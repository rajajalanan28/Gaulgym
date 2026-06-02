# Design System - Gym Management Website

## Overview

Design system ini di-convert dari Flutter app gym management system. Menggunakan tema dark Nike-inspired dengan primary color orange (#FF5722) dan secondary color cyan (#00BCD4).

---

## Color Palette

### Primary Colors
| Name | Hex | Usage |
|------|-----|-------|
| Primary | `#FF5722` | CTAs, buttons, branding |
| Primary Light | `#FF8A50` | Hover states |
| Primary Dark | `#E64A19` | Active states |

### Secondary Colors
| Name | Hex | Usage |
|------|-----|-------|
| Secondary | `#00BCD4` | Accent elements |

### Background & Surface
| Name | Hex | Usage |
|------|-----|-------|
| Background | `#121212` | App background (darkest) |
| Surface | `#1E1E1E` | Cards, dialogs |
| Surface Variant | `#2C2C2C` | Input fields |
| Card Background | `#1A1A1A` | Card containers |

### Text Colors
| Name | Hex | Usage |
|------|-----|-------|
| Text Primary | `#FFFFFF` | Main text |
| Text Secondary | `#B0B0B0` | Subtitles |
| Text Hint | `#707070` | Placeholders |

### Semantic Colors
| Name | Hex | Usage |
|------|-----|-------|
| Success | `#4CAF50` | Success states |
| Error | `#EF5350` | Error states |
| Warning | `#FFB74D` | Warnings |
| Info | `#29B6F6` | Information

---

## Gradients

### Primary Gradient
background: linear-gradient(135deg, #FF5722 0%, #FF8A50 100%)

### Card Gradient
background: linear-gradient(180deg, #2C2C2C 0%, #1E1E1E 100%)

---

## Spacing

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Tight spacing |
| sm | 8px | Compact elements |
| md | 16px | Standard padding |
| lg | 24px | Section spacing |
| xl | 32px | Large gaps |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| sm | 8px | Chips, small buttons |
| md | 12px | Cards, buttons |
| lg | 16px | Large cards, modals |
| xl | 20px | Dialogs

---

## Components

### 1. StatCard
Display metrics on dashboard with icon, value, and label.

### 2. WelcomeCard
Hero greeting card with gradient background.

### 3. MenuItem
Navigation item with icon, title, and chevron.

---

## Layout

- Max container width: 1200px
- Page padding: 24px
- Section gap: 32px

---

## Roadmap

- Add Button, Input, Table, Modal components
- Integrate Supabase auth
- Add responsive breakpoints

