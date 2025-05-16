// src/theme/index.ts

import {
  extendTheme,
  ThemeConfig,
  createMultiStyleConfigHelpers,
  type StyleFunctionProps,
} from '@chakra-ui/react'
import { mode } from '@chakra-ui/theme-tools'

// --------------------------------------------------------------------------
// 0. Core Configuration
// --------------------------------------------------------------------------
const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
  cssVarPrefix: 'eg',
}

// --------------------------------------------------------------------------
// 1. Scales & Primitives
// --------------------------------------------------------------------------
const breakpoints = {
  base: '0em',
  sm:   '30em',
  md:   '48em',
  lg:   '62em',
  xl:   '80em',
  '2xl':'96em',
}

const colors = {
  // Primary: Teal/Cyan
  brand: { 50: '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4', 300: '#5eead4', 400: '#2dd4bf', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e', 800: '#115e59', 900: '#134e4a' },
  // Neutrals: Warmer Gray (Stone)
  neutral: { 50: '#fafaf9', 100: '#f5f5f4', 200: '#e7e5e4', 300: '#d6d3d1', 400: '#a8a29e', 500: '#78716c', 600: '#57534e', 700: '#44403c', 800: '#292524', 900: '#1c1917' },
  // Accent: Indigo
  accent: { 50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc', 400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca', 800: '#3730a3', 900: '#312e81' },
  // Status colors can remain similar or be adjusted for harmony
  success: { 50: '#f7fee7', 100: '#ecfccb', 200: '#d9f99d', 300: '#bef264', 400: '#a3e635', 500: '#84cc16', 600: '#65a30d', 700: '#4d7c0f', 800: '#3f6212', 900: '#365314' },
  warning: { 50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309', 800: '#92400e', 900: '#78350f' },
  danger: { 50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5', 400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c', 800: '#991b1b', 900: '#7f1d1d' },
  info: { 50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a' }, // Using Blue for Info
  purple: { 50:'#faf5ff',100:'#f3e8ff',200:'#e9d5ff',300:'#d8b4fe',400:'#c084fc',500:'#a855f7',600:'#9333ea',700:'#7e22ce',800:'#6b21a8',900:'#581c87' },
  whiteAlpha: {
    50:'rgba(255,255,255,0.04)',100:'rgba(255,255,255,0.06)',200:'rgba(255,255,255,0.08)',
    300:'rgba(255,255,255,0.16)',400:'rgba(255,255,255,0.24)',500:'rgba(255,255,255,0.36)',
    600:'rgba(255,255,255,0.48)',700:'rgba(255,255,255,0.64)',800:'rgba(255,255,255,0.80)',
    900:'rgba(255,255,255,0.92)',
  },
  blackAlpha: {
    50:'rgba(0,0,0,0.04)',100:'rgba(0,0,0,0.06)',200:'rgba(0,0,0,0.08)',
    300:'rgba(0,0,0,0.16)',400:'rgba(0,0,0,0.24)',500:'rgba(0,0,0,0.36)',
    600:'rgba(0,0,0,0.48)',700:'rgba(0,0,0,0.64)',800:'rgba(0,0,0,0.80)',
    900:'rgba(0,0,0,0.92)',
  },
}

const fonts = {
  heading: `'Inter', sans-serif`,
  body:    `'Open Sans', sans-serif`,
  mono:    `'Fira Code', monospace`,
}

const fontSizes = {
  '2xs':'0.625rem','xs':'0.75rem','sm':'0.875rem','md':'1rem','lg':'1.125rem','xl':'1.25rem',
  '2xl':'1.5rem','3xl':'1.875rem','4xl':'2.25rem','5xl':'3rem','6xl':'3.75rem','7xl':'4.5rem',
}

const fontWeights = {
  light:300, normal:400, medium:500, semibold:600, bold:700, extrabold:800, black:900,
}

const lineHeights = {
  none:1, tight:1.25, snug:1.375, normal:1.5, relaxed:1.625, loose:2,
}

const letterSpacings = {
  tighter:'-0.05em', tight:'-0.025em', normal:'0', wide:'0.025em', wider:'0.05em', widest:'0.1em',
}

// Expanded spacing (up to 24rem)
const space = {
  px:'1px',0:'0',0.5:'0.125rem',1:'0.25rem',1.5:'0.375rem',2:'0.5rem',2.5:'0.625rem',3:'0.75rem',
 3.5:'0.875rem',4:'1rem',5:'1.25rem',6:'1.5rem',7:'1.75rem',8:'2rem',9:'2.25rem',10:'2.5rem',
 12:'3rem',14:'3.5rem',16:'4rem',20:'5rem',24:'6rem',32:'8rem',40:'10rem',48:'12rem',56:'14rem',
 64:'16rem',80:'20rem',96:'24rem',
}

const sizes = {
  max:'100%', min:'0px',
  container:{ sm:'640px', md:'768px', lg:'1024px', xl:'1280px','2xl':'1536px' },
  icon:{ xs:'0.75rem', sm:'1rem', md:'1.25rem', lg:'1.5rem', xl:'2rem' },
  avatar:{ xs:'1rem', sm:'2rem', md:'3rem', lg:'4rem', xl:'6rem' },
}

const radii = {
  none:'0', sm:'0.125rem', md:'0.375rem', lg:'0.5rem', xl:'1rem','2xl':'1.5rem', full:'9999px',
}

// Crisper shadows
const shadows = {
  xs:'0 0 0 1px rgba(0,0,0,0.05)',
  sm:'0 1px 3px rgba(0,0,0,0.1)',
  md:'0 4px 6px rgba(0,0,0,0.1)',
  lg:'0 10px 15px rgba(0,0,0,0.1)',
  xl:'0 20px 25px rgba(0,0,0,0.1)',
  outline:'0 0 0 3px var(--eg-colors-brand-300)',
  inner:'inset 0 2px 4px rgba(0,0,0,0.06)',
}

const zIndices = {
  hide:-1, auto:'auto', base:0, docked:10, dropdown:1000,
  sticky:1100, banner:1200, overlay:1300, modal:1400, popover:1500, tooltip:1600,
}

const opacity = {
  '0':'0','5':'0.05','10':'0.1','20':'0.2','30':'0.3','40':'0.4','50':'0.5','60':'0.6','70':'0.7','80':'0.8','90':'0.9','100':'1',
}

const blur = {
  none:'0', xs:'blur(2px)', sm:'blur(4px)', md:'blur(8px)', lg:'blur(12px)', xl:'blur(24px)',
}

const filters = {
  none:'none', grayscale:'grayscale(100%)', sepia:'sepia(100%)', invert:'invert(100%)',
}

// Slightly faster motion defaults
const motion = {
  duration:{ ultrafast:'50ms', faster:'100ms', fast:'120ms', normal:'180ms', slow:'240ms', slower:'300ms', ultraslow:'400ms' },
  timing:{ in:'cubic-bezier(0.4,0,0.2,1)', out:'cubic-bezier(0,0,0.2,1)', 'in-out':'cubic-bezier(0.4,0,0.2,1)' },
  property:{ common:'background-color,border-color,color,transform,opacity,box-shadow' },
  reduced:'@media (prefers-reduced-motion: reduce)',
}

// --------------------------------------------------------------------------
// 2. Semantic Tokens
// --------------------------------------------------------------------------
const semanticTokens = {
  colors: {
    // Base & Layout
    'bg.app':       { default: 'neutral.50',       _dark: 'brand.900' },
    'bg.surface':   { default: 'white',  _dark: 'neutral.800' },
    'bg.elevated':  { default: 'white',       _dark: 'neutral.700' },
    'bg.page':      { default: 'neutral.50',  _dark: 'neutral.900' },
    'bg.header':    { default: 'white',       _dark: 'neutral.800' },
    'bg.sidebar':   { default: 'neutral.100', _dark: 'neutral.700' },
    'bg.content':   { default: 'white',       _dark: 'neutral.800' },
    'bg.card':      { default: 'white',       _dark: 'neutral.700' },
    'bg.modal':     { default: 'neutral.50',  _dark: 'neutral.800' }, // Adjusted dark for contrast
    'bg.subtle':    { default: 'neutral.50',  _dark: 'neutral.800' },

    // Text
    'text.primary':   { default: 'neutral.900', _dark: 'whiteAlpha.900' },
    'text.secondary': { default: 'neutral.600', _dark: 'neutral.400' },
    'text.muted':     { default: 'neutral.500', _dark: 'neutral.400' }, // Alias for secondary
    'text.placeholder':{ default: 'neutral.400', _dark: 'neutral.400' },
    'text.heading':   { default: 'neutral.900', _dark: 'whiteAlpha.900' },
    'text.link':      { default: 'brand.600',   _dark: 'brand.400' },
    'text.inverted':  { default: 'white',       _dark: 'neutral.900' },
    'text.disabled':  { default: 'neutral.400', _dark: 'neutral.400' },
    'text.critical':  { default: 'danger.600',  _dark: 'danger.300' }, // Adjusted danger
    'text.danger':    { default: 'danger.500',  _dark: 'danger.300' }, // Alias for critical

    // Borders
    'border.base':    { default: 'neutral.200', _dark: 'neutral.700' },
    'border.primary': { default: 'neutral.300', _dark: 'neutral.600' }, // Stronger than base
    'border.secondary':{ default: 'neutral.200', _dark: 'neutral.700' }, // Alias for base
    'border.divider': { default: 'neutral.200', _dark: 'neutral.700' }, // Alias for base
    'border.input':   { default: 'neutral.300', _dark: 'neutral.600' },
    'border.input_hover':{ default: 'neutral.400',_dark: 'neutral.500' },
    'border.focus':   { default: 'brand.500',   _dark: 'brand.500' },
    'border.accent':  { default: 'accent.500',  _dark: 'accent.300' },
    'border.danger':  { default: 'danger.300',  _dark: 'danger.400' }, // Adjusted danger
    'border.subtle':  { default: 'neutral.400', _dark: 'neutral.500' }, // Added for hover states etc.
    'border.checkbox':{ default: 'neutral.300', _dark: 'neutral.600' },
    'border.checkbox.checked': { default: 'success.500', _dark: 'success.300' },

    // Inputs & Controls
    'bg.input':       { default: 'white',       _dark: 'neutral.700' },
    'bg.checkbox.checked': { default: 'success.500', _dark: 'success.300' },

    // Buttons
    'bg.button.primary': { default: 'brand.500',   _dark: 'brand.500' },
    'bg.button.primary.hover': { default: 'brand.600', _dark: 'brand.400' },
    'bg.button.secondary':{ default: 'neutral.100', _dark: 'neutral.600' },
    'bg.button.accent':  { default: 'accent.500',  _dark: 'accent.500' },
    'bg.button.accent.hover': { default: 'accent.600',_dark: 'accent.400' },
    'bg.button.danger':  { default: 'danger.500',  _dark: 'danger.500' },
    'bg.button.danger.hover': { default: 'danger.600',_dark: 'danger.400' },
    'text.button.primary':{ default: 'white',       _dark: 'white' },
    'text.button.secondary':{ default: 'neutral.800',_dark: 'whiteAlpha.900' },
    'text.button.accent': { default: 'white',       _dark: 'neutral.900' },

    // Interactions & States
    'interaction.hover': { default: 'neutral.100', _dark: 'whiteAlpha.100' },
    'interaction.active':{ default: 'neutral.200', _dark: 'whiteAlpha.200' },
    'interaction.disabled':{ default: 'neutral.100',_dark: 'whiteAlpha.100' },
    'bg.hover.nav':   { default: 'neutral.100', _dark: 'neutral.700' },
    'bg.active.nav':  { default: 'brand.100',    _dark: 'brand.700' },
    'bg.focus':       { default: 'rgba(66, 153, 225, 0.6)', _dark: 'rgba(66, 153, 225, 0.6)' },
    'bg.danger.hover':{ default: 'danger.100',  _dark: 'rgba(229, 62, 62, 0.2)' },
    'bg.danger.subtle':{ default: 'danger.50',   _dark: 'rgba(229, 62, 62, 0.1)' },
    'bg.overlay':     { default: 'blackAlpha.600', _dark: 'blackAlpha.700' },

    // Statuses
    'status.success': { default: 'success.500', _dark: 'success.300' },
    'status.warning': { default: 'warning.500', _dark: 'warning.300' },
    'status.error':   { default: 'danger.500',  _dark: 'danger.300' },
    'status.info':    { default: 'info.500',    _dark: 'info.300' },
    'bg.status.success.subtle': { default: 'success.50', _dark: 'rgba(56, 161, 105, 0.1)' },
    'text.status.success': { default: 'success.700', _dark: 'success.300' },
    'bg.status.info.subtle': { default: 'info.50', _dark: 'rgba(45, 106, 238, 0.1)' }, // Using info/blue
    'text.status.info': { default: 'info.700', _dark: 'info.300' },

    // Badges (from previous attempt)
    'badge.bg.info':      { default: 'blue.50',       _dark: 'blue.800' },
    'badge.text.info':    { default: 'blue.800',      _dark: 'blue.200' },
    'badge.bg.success':   { default: 'green.50',      _dark: 'green.800' },
    'badge.text.success': { default: 'green.800',     _dark: 'green.200' },
    'badge.bg.neutral':   { default: 'neutral.100',   _dark: 'neutral.700' },
    'badge.text.neutral': { default: 'neutral.800',   _dark: 'neutral.200' },

    // Progress (from previous attempt)
    'progress.track.bg':        { default: 'neutral.100', _dark: 'neutral.700' },
    'progress.filledTrack.bg':  { default: 'brand.500',   _dark: 'brand.300' },

    // Misc
    'bg.tooltip':     { default: 'neutral.800', _dark: 'neutral.600' },
    'icon.default':   { default: 'neutral.500', _dark: 'neutral.400' },
    'icon.primary':   { default: 'brand.500',   _dark: 'brand.400' },
    'icon.secondary': { default: 'neutral.400', _dark: 'neutral.500' },
    'icon.hover':     { default: 'brand.600',   _dark: 'brand.200' },
    'icon.disabled':  { default: 'neutral.300', _dark: 'neutral.600' },
    'icon.inverted':  { default: 'whiteAlpha.900', _dark: 'neutral.900' },
    'icon.accent':    { default: 'accent.500',  _dark: 'accent.300' },
    'icon.active':    { default: 'brand.500',   _dark: 'brand.400' },
    'accent.active':  { default: 'accent.500',  _dark: 'accent.300' }, // For active indicators
    'task.item.bg':           { default: 'white',         _dark: 'neutral.700' },
    'task.item.completed.bg': { default: 'neutral.50',    _dark: 'neutral.800' },
    'task.item.flash.bg':     { default: 'yellow.100',    _dark: 'yellow.700' }, // Using warning scale

    // --- Form Specific Tokens ---
    'form.label.text':         { default: 'text.secondary', _dark: 'text.secondary' },
    'form.helperText.text':    { default: 'text.muted', _dark: 'text.muted' },

    // --- Table Specific Tokens ---
    'table.header.bg':         { default: 'neutral.100', _dark: 'neutral.700' },
    'table.header.text':       { default: 'text.secondary', _dark: 'text.secondary' },
    'table.row.bg':            { default: 'transparent', _dark: 'transparent' }, // Inherits from card/surface
    'table.row.hover.bg':      { default: 'neutral.100', _dark: 'neutral.600' },
    'table.row.striped.bg':    { default: 'neutral.50',  _dark: 'whiteAlpha.50' },
    'table.cell.border':       { default: 'border.base', _dark: 'border.base' },

    // --- Task Status Tokens ---
    'status.completed.text':   { default: 'success.700', _dark: 'success.200' },
    'status.completed.bg':     { default: 'success.50',  _dark: 'success.800' },
    'status.inProgress.text':  { default: 'info.700',    _dark: 'info.200' },
    'status.inProgress.bg':    { default: 'info.50',     _dark: 'info.800' },
    'status.blocked.text':     { default: 'danger.700',  _dark: 'danger.200' },
    'status.blocked.bg':       { default: 'danger.50',   _dark: 'danger.800' },
    'status.todo.text':        { default: 'neutral.700', _dark: 'neutral.200' },
    'status.todo.bg':          { default: 'neutral.100', _dark: 'neutral.600' },

    // --- Task Priority Tokens ---
    'priority.high.icon':      { default: 'danger.500',  _dark: 'danger.300' },
    'priority.high.text':      { default: 'danger.700',  _dark: 'danger.200' },
    'priority.high.bg':        { default: 'danger.50',   _dark: 'danger.800' },
    'priority.medium.icon':    { default: 'warning.500', _dark: 'warning.300' },
    'priority.medium.text':    { default: 'warning.700', _dark: 'warning.200' },
    'priority.medium.bg':      { default: 'warning.50',  _dark: 'warning.800' },
    'priority.low.icon':       { default: 'info.500',    _dark: 'info.300' },
    'priority.low.text':       { default: 'info.700',    _dark: 'info.200' },
    'priority.low.bg':         { default: 'info.50',     _dark: 'info.800' },

    // --- Tag Tokens ---
    'tag.project.bg':          { default: 'accent.100',  _dark: 'accent.700' },
    'tag.project.text':        { default: 'accent.700',  _dark: 'accent.200' },

    // --- Task Item Hover ---
    'taskItem.compact.hover.bg':  { default: 'neutral.100', _dark: 'neutral.800' },
    'taskItem.default.hover.bg':  { default: 'neutral.50',  _dark: 'neutral.700' },

    // --- Actions ---
    'actions.danger.text':     { default: 'danger.600',  _dark: 'danger.300' },

    // Stat Card Icons (Dashboard Specific for now, can be generalized)
    'icon.stat.project':   { default: 'accent.500',  _dark: 'accent.300' },   // Example: Indigo
    'icon.stat.task':      { default: 'brand.500',   _dark: 'brand.300' },    // Example: Teal
    'icon.stat.agent':     { default: 'purple.500',  _dark: 'purple.300' },   // Example: Purple
    'icon.stat.completed': { default: 'success.500', _dark: 'success.300' },// Example: Green
    'icon.stat.pending':   { default: 'warning.500', _dark: 'warning.300' },// Example: Yellow

    // Chart Specific Colors
    'chart.primary.fill':      { default: 'brand.500', _dark: 'brand.400'},
    'chart.secondary.fill':    { default: 'accent.500',  _dark: 'accent.400' },
    'chart.grid':              { default: 'neutral.200', _dark: 'neutral.700' }, // Already 'border.secondary' essentially
    'chart.text':              { default: 'neutral.600', _dark: 'neutral.400' }, // Already 'text.secondary'
    'chart.tooltip.bg':        { default: 'neutral.800', _dark: 'neutral.600' }, // Already 'bg.tooltip'
    'chart.tooltip.border':    { default: 'neutral.300', _dark: 'neutral.600' }, // Already 'border.primary'
    'chart.tooltip.label':     { default: 'neutral.900', _dark: 'whiteAlpha.900' }, // Already 'text.primary'
    'chart.tooltip.item':      { default: 'neutral.600', _dark: 'neutral.400' }, // Already 'text.secondary'
    'chart.pie.label.text':    { default: 'white', _dark: 'neutral.900' }, // For labels on pie charts (e.g. white on dark purple slice)

    // Kanban specific (if needed, can be expanded)
    'kanban.column.bg': { default: 'neutral.50', _dark: 'neutral.800' },

    // NEW Tokens for subtle branding
    'bg.brand.subtle':    { default: 'brand.50', _dark: 'rgba(20, 184, 166, 0.1)' }, // For light teal backgrounds
    'border.brand.subtle':{ default: 'brand.200', _dark: 'brand.700' }, // For subtle brand-colored borders

    // ... add other specific component states as needed
  },
  space,
  sizes,
  radii,
  shadows,
  zIndices,
  opacity,
  blur,
  filters,
  motion,
  fontSizes,
  fontWeights,
  lineHeights,
  letterSpacings,
  fonts,
  // Removed duplicate 'colors' property which was causing a lint error.
  // The 'colors' property for semantic tokens is defined explicitly above.
}

// --------------------------------------------------------------------------
// 3. Global Styles (Optional)
// --------------------------------------------------------------------------

// --------------------------------------------------------------------------
// 4. Component Styles
// --------------------------------------------------------------------------
const menuHelper   = createMultiStyleConfigHelpers(['button','list','item','groupTitle','command','divider'])
const Menu         = menuHelper.defineMultiStyleConfig({
  baseStyle: (props: StyleFunctionProps) => ({
    list: {
      bg: mode('white', 'neutral.800')(props),
      borderColor: mode('neutral.300', 'neutral.600')(props),
      borderWidth: '1px',
      boxShadow: mode('md', 'lg')(props),
      color: mode('neutral.900', 'whiteAlpha.900')(props),
      minWidth: 'xs',
      py: '2',
      zIndex: 'popover',
    },
    item: {
      bg: 'transparent',
      color: mode('neutral.900', 'whiteAlpha.900')(props),
      py: '0.4rem',
      px: '0.8rem',
      transitionProperty: 'background',
      transitionDuration: 'ultra-fast',
      transitionTimingFunction: 'ease-in',
      _hover: {
        bg: mode('neutral.100', 'neutral.700')(props),
      },
      _focus: {
        bg: mode('neutral.100', 'neutral.700')(props),
      },
      _active: {
        bg: mode('neutral.200', 'neutral.600')(props),
      },
      cursor: 'pointer',
      _disabled: { color: 'text.muted', cursor: 'not-allowed' }
    },
  })
})

const tabsHelper   = createMultiStyleConfigHelpers(['root','tablist','tab','tabpanel','indicator'])
const Tabs         = tabsHelper.defineMultiStyleConfig({
  baseStyle: tabsHelper.definePartsStyle({
    tablist: { borderBottom:'1px solid', borderColor:'border.base' },
    tab:     {
      px:4, 
      py:2, 
      fontWeight:'semibold',
      color: 'text.secondary',
      _selected:{
        color:'brand.600', 
        borderColor:'brand.500',
        borderBottomWidth:'2px',
        _dark: {
          color: 'brand.300',
          borderColor: 'brand.400',
        }
      },
      _hover: {
        color: 'brand.500',
        bg: 'bg.hover.nav',
      },
      _disabled: {
        color: 'text.disabled',
        cursor: 'not-allowed',
      }
    },
    tabpanel:{ p:4 },
  }),
})

const alertHelper  = createMultiStyleConfigHelpers(['container','title','description','icon'])
const Alert        = alertHelper.defineMultiStyleConfig({
  baseStyle: alertHelper.definePartsStyle((props) => {
    const { colorScheme = 'info' } = props;
    return {
      container:{ w:'100%', borderRadius:'md', display:'flex', alignItems:'flex-start', gap:3, py:3, px:4 },
      title:{ fontWeight:'bold', mr:2, lineHeight: 'short' },
      description:{ flex:1, fontSize: 'sm' },
      icon:{ mr:3, mt: '0.125em', color: mode(`${colorScheme}.600`, `${colorScheme}.400`)(props) },
    };
  }),
  variants: {
    subtle: alertHelper.definePartsStyle((props) => ({
      container:{ 
        bg: mode(`${props.colorScheme ?? 'info'}.50`, `${props.colorScheme ?? 'info'}.900`)(props),
        color: mode(`${props.colorScheme ?? 'info'}.700`, `${props.colorScheme ?? 'info'}.200`)(props), 
      }
    })),
    solid:  alertHelper.definePartsStyle((props) => ({
      container:{ 
        bg:mode(`${props.colorScheme ?? 'info'}.500`, `${props.colorScheme ?? 'info'}.600`)(props),
        color:'white', 
      } 
    })),
    'left-accent': alertHelper.definePartsStyle((props) => ({
      container: {
        borderLeftWidth: '4px',
        borderLeftColor: mode(`${props.colorScheme ?? 'info'}.500`, `${props.colorScheme ?? 'info'}.300`)(props),
        bg: mode(`${props.colorScheme ?? 'info'}.50`, `${props.colorScheme ?? 'info'}.900`)(props),
        color: mode(`${props.colorScheme ?? 'info'}.700`, `${props.colorScheme ?? 'info'}.200`)(props),
      }
    })),
  },
  defaultProps:{ variant:'subtle', colorScheme:'info' },
})

const tagHelper    = createMultiStyleConfigHelpers(['container','label','closeButton'])
const Tag          = tagHelper.defineMultiStyleConfig({
  baseStyle: tagHelper.definePartsStyle({ container:{ fontWeight:'medium', borderRadius:'md' }}),
  sizes: {
    sm: tagHelper.definePartsStyle({ container:{ fontSize:'xs', px:2, py:0.5 }}),
    md: tagHelper.definePartsStyle({ container:{ fontSize:'sm', px:2.5, py:1 }}),
    lg: tagHelper.definePartsStyle({ container:{ fontSize:'md', px:3, py:1.5 }}),
  },
  variants: {
    solid:  tagHelper.definePartsStyle((props) => {
      const { colorScheme: c } = props;
      return {
        container: { 
          bg: mode(`${c}.500`, `${c}.500`)(props), 
          color: 'white', 
          _dark: { 
            bg: `${c}.500`,
            color: (c === 'neutral' ? 'neutral.900' : 'white'),
          }
        }
      }
    }),
    subtle: tagHelper.definePartsStyle((props) => {
      const { colorScheme: c } = props;
      return {
        container: { 
          bg: mode(`${c}.100`, `${c}.700`)(props), 
          color: mode(`${c}.700`, `${c}.200`)(props), 
          _dark: {
            bg: `${c}.700`,
            color: `${c}.100`,
          }
        }
      }
    }),
    outline: tagHelper.definePartsStyle((props) => {
      const { colorScheme: c } = props;
      return {
        container: {
          color: mode(`${c}.600`, `${c}.300`)(props),
          borderColor: mode(`${c}.500`, `${c}.300`)(props),
          borderWidth: '1px',
        }
      }
    }),
  },
  defaultProps:{ size:'md', variant:'subtle', colorScheme:'brand' },
})

const badgeHelper  = createMultiStyleConfigHelpers(['label'])
const Badge        = badgeHelper.defineMultiStyleConfig({
  baseStyle: badgeHelper.definePartsStyle({ 
    label:{ 
      fontSize:'xs',
      fontWeight:'bold', 
      px:2.5,
      py:1,
      borderRadius:'md',
      textTransform: 'uppercase',
      lineHeight: 'short'
    }
  }),
  variants: {
    solid:   badgeHelper.definePartsStyle((props) => {
      const { colorScheme: c } = props;
      return {
        label:{ 
          bg: mode(`${c}.500`, `${c}.500`)(props),
          color: 'white', 
          _dark: { 
            bg: `${c}.500`,
            color: (c === 'neutral' ? 'neutral.900' : 'white'),
          }
        }
      }
    }),
    subtle: badgeHelper.definePartsStyle((props) => {
      const { colorScheme: c } = props;
      return {
        label:{ 
          bg: mode(`${c}.100`, `${c}.700`)(props),
          color: mode(`${c}.700`, `${c}.200`)(props),
          _dark: {
            bg: `${c}.700`,
            color: `${c}.100`,
          }
        }
      }
    }),
    outline: badgeHelper.definePartsStyle((props) => {
      const { colorScheme: c } = props;
      return {
        label:{ 
          border:'1px solid', 
          borderColor: mode(`${c}.500`, `${c}.300`)(props), 
          color: mode(`${c}.600`, `${c}.300`)(props)
        }
      }
    }),
  },
  defaultProps:{ variant:'solid', colorScheme:'brand' },
})

const cardHelper   = createMultiStyleConfigHelpers(['container','header','body','footer'])
const Card         = cardHelper.defineMultiStyleConfig({
  baseStyle: cardHelper.definePartsStyle({
    container: {
      bg: 'bg.surface',
      borderWidth: '1px',
      borderColor: 'border.base',
      boxShadow: 'sm',
      borderRadius: 'lg', // Was 'container', using 'lg' for more rounded look
      p:4
    }
  }),
  variants: {
    elevated: cardHelper.definePartsStyle({
      container: {
        bg: 'bg.elevated',
        boxShadow: 'lg'
      }
    }),
    outlined: cardHelper.definePartsStyle({
      container: {
        borderColor: 'border.primary'
      }
    }),
    brandHighlight: cardHelper.definePartsStyle({ // NEW Variant
      container: {
        borderTopWidth: '4px',
        borderTopColor: 'brand.500',
      }
    }),
  },
  defaultProps:{
    variant:'elevated'
  },
})

const switchHelper = createMultiStyleConfigHelpers(['container','track','thumb'])
const Switch       = switchHelper.defineMultiStyleConfig({
  baseStyle: switchHelper.definePartsStyle({
    track:{ bg:'neutral.300', _checked:{ bg:'brand.500' }},
    thumb:{ bg:'white', boxSize:4, _checked:{ transform:'translateX(1rem)' }},
  }),
})

// NEW COMPONENT STYLES START
const inputHelper = createMultiStyleConfigHelpers(['addon', 'field', 'element'])
const Input = inputHelper.defineMultiStyleConfig({
  baseStyle: inputHelper.definePartsStyle({
    field: {
      bg: 'bg.input',
      borderColor: 'border.input',
      color: 'text.primary',
      _hover: {
        borderColor: 'border.input_hover',
      },
      _focusVisible: { // Changed from _focus for better accessibility and consistency
        borderColor: 'border.focus',
        boxShadow: 'outline',
      },
      _placeholder: {
        color: 'text.placeholder',
      },
      _disabled: {
        opacity: 0.6,
        cursor: 'not-allowed',
        bg: 'neutral.100',
        _dark: {
          bg: 'neutral.700',
        }
      }
    },
  }),
  variants: { // Define variants like outline, filled, unstyled if needed, or rely on baseStyle.
    outline: inputHelper.definePartsStyle({ // Example for outline variant
      field: {
        borderWidth: '1px',
        borderRadius: 'md', // or use radii.md
      }
    })
  },
  defaultProps: {
    variant: 'outline', // Set a default variant
  }
})

const Textarea = { // Textarea can often reuse Input styles or have its own
  baseStyle: {
    bg: 'bg.input',
    borderColor: 'border.input',
    color: 'text.primary',
    borderRadius: 'md',
    _hover: {
      borderColor: 'border.input_hover',
    },
    _focusVisible: {
      borderColor: 'border.focus',
      boxShadow: 'outline',
    },
    _placeholder: {
      color: 'text.placeholder',
    },
     _disabled: {
        opacity: 0.6,
        cursor: 'not-allowed',
        bg: 'neutral.100',
        _dark: {
          bg: 'neutral.700',
        }
      }
  },
  defaultProps: {
    variant: 'outline', // Assuming an outline variant is standard
  }
}

const selectHelper = createMultiStyleConfigHelpers(['field', 'icon'])
const Select = selectHelper.defineMultiStyleConfig({
  baseStyle: selectHelper.definePartsStyle({
    field: {
      bg: 'bg.input',
      borderColor: 'border.input',
      color: 'text.primary',
      borderRadius: 'md',
      _hover: {
        borderColor: 'border.input_hover',
      },
      _focusVisible: {
        borderColor: 'border.focus',
        boxShadow: 'outline',
      },
      _disabled: {
        opacity: 0.6,
        cursor: 'not-allowed',
        bg: 'neutral.100',
        _dark: {
          bg: 'neutral.700',
        }
      }
    },
    icon: {
      color: 'icon.secondary', // Color for the dropdown arrow
      fontSize: 'xl', // Adjust size if needed
    },
  }),
  defaultProps: {
    variant: 'outline',
  }
})

const checkboxHelper = createMultiStyleConfigHelpers(['container', 'control', 'label', 'icon'])
const Checkbox = checkboxHelper.defineMultiStyleConfig({
  baseStyle: checkboxHelper.definePartsStyle({
    control: {
      borderColor: 'border.checkbox',
      bg: 'transparent', // Or bg.surface if preferred for unchecked state
      _checked: {
        bg: 'bg.checkbox.checked',
        borderColor: 'border.checkbox.checked',
        color: 'icon.inverted', // For the checkmark
        _hover: {
          bg: 'brand.600', // Slightly darker on hover when checked
          borderColor: 'brand.600',
        }
      },
      _hover: {
        borderColor: 'border.input_hover', // Hover for unchecked state
      },
      _focusVisible: {
        boxShadow: 'outline',
      },
      _disabled: {
        bg: 'neutral.200',
        borderColor: 'neutral.300',
        _dark: {
            bg: 'neutral.600',
            borderColor: 'neutral.500',
        }
      }
    },
    label: {
      color: 'text.primary',
      ml: 2,
      _disabled: {
        color: 'text.disabled',
      }
    },
  }),
})

const formLabelHelper = createMultiStyleConfigHelpers([]) // FormLabel is simple
const FormLabel = formLabelHelper.defineMultiStyleConfig({
    baseStyle:{
        color: 'form.label.text', // text.secondary
        fontWeight: 'medium', // A bit more emphasis than normal text
        mb:1, // Default margin bottom
        fontSize: 'sm',
    }
})
// NEW COMPONENT STYLES END

// Global Styles
const styles = {
  global: (props: StyleFunctionProps) => ({
    body: {
      fontFamily: 'body',
      bg: mode('neutral.50', 'brand.900')(props),
      color: mode('neutral.900', 'whiteAlpha.900')(props),
      lineHeight: 'base',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
      transitionProperty: 'background-color, color',
      transitionDuration: 'normal',
    },
    'html, body': {
      height: '100%',
    },
    '#__next': {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    },
    a: {
      color: 'link.primary',
      _hover: {
        color: 'link.hover',
        textDecoration: 'underline',
      },
    },
  }),
  components: {
    Menu,
    Tabs,
    Alert,
    Tag,
    Badge,
    Card,
    Switch,
    Input,      // Added
    Textarea,   // Added
    Select,     // Added
    Checkbox,   // Added
    FormLabel,  // Added
  },
}

// --------------------------------------------------------------------------
// 5. Final Assembly
// --------------------------------------------------------------------------
const theme = extendTheme({
  config,
  styles,
  colors,
  breakpoints,
  fonts,
  fontSizes,
  fontWeights,
  lineHeights,
  letterSpacings,
  space,
  sizes,
  radii,
  shadows,
  zIndices,
  opacity,
  blur,
  filters,
  motion,
  semanticTokens,
})

export type Theme = typeof theme
export default theme
