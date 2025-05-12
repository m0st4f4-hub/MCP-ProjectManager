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
    'bg.app':       { default: 'white',       _dark: 'neutral.900' },
    'bg.surface':   { default: 'neutral.50',  _dark: 'neutral.800' },
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
    'text.link':      { default: 'brand.600',   _dark: 'brand.300' },
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
    'border.focus':   { default: 'brand.500',   _dark: 'brand.300' },
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
    'bg.active.nav':  { default: 'brand.50',    _dark: 'brand.800' }, // Adjusted dark for contrast
    'bg.focus':       { default: 'rgba(66, 153, 225, 0.6)', _dark: 'rgba(66, 153, 225, 0.6)' },
    'bg.danger.hover':{ default: 'danger.100',  _dark: 'rgba(229, 62, 62, 0.2)' },
    'bg.danger.subtle':{ default: 'danger.50',   _dark: 'rgba(229, 62, 62, 0.1)' },

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
    'icon.primary':   { default: 'brand.500',   _dark: 'brand.300' },
    'icon.secondary': { default: 'neutral.400', _dark: 'neutral.500' },
    'icon.hover':     { default: 'brand.600',   _dark: 'brand.200' },
    'icon.disabled':  { default: 'neutral.300', _dark: 'neutral.600' },
    'icon.inverted':  { default: 'whiteAlpha.900', _dark: 'neutral.900' },
    'icon.accent':    { default: 'accent.500',  _dark: 'accent.300' },
    'icon.active':    { default: 'brand.500',   _dark: 'brand.300' },
    'accent.active':  { default: 'accent.500',  _dark: 'accent.300' }, // For active indicators
    'task.item.bg':           { default: 'white',         _dark: 'neutral.700' },
    'task.item.completed.bg': { default: 'neutral.50',    _dark: 'neutral.800' },
    'task.item.flash.bg':     { default: 'yellow.100',    _dark: 'yellow.700' }, // Using warning scale

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
// 3. Global Styles & Accessibility
// --------------------------------------------------------------------------
const globalStyles = {
  global: (props: StyleFunctionProps) => ({
    'html, body': {
      bg:   mode('bg.app','neutral.900')(props),
      color:mode('text.base','neutral.100')(props),
      fontFamily:'body',
      lineHeight:'normal',
      height:'100%', width:'100%',
      overflowX:'hidden',
    },
    a: {
      color:           mode('text.link','brand.300')(props),
      textDecoration:  'none',
      transition:      `color ${motion.duration.fast} ${motion.timing.out}`,
      _hover:          { textDecoration:'underline' },
      _focusVisible:   { boxShadow:'outline', outline:'none' },
    },
    '*:focus-visible': { boxShadow:'outline', outline:'none' },
    '::selection':     { bg:'accent.300', color:'white' },
    '*,*::before,*::after': { boxSizing:'border-box' },
    '::-webkit-scrollbar':   { width:'8px', height:'8px' },
    '::-webkit-scrollbar-track': { bg:mode('neutral.100','neutral.700')(props), borderRadius:'full' },
    '::-webkit-scrollbar-thumb': {
      bg:mode('neutral.400','neutral.500')(props),
      borderRadius:'full',
      '&:hover': { bg:mode('neutral.500','neutral.600')(props) },
    },
  }),
}

// --------------------------------------------------------------------------
// 4. Component Recipes (Alert baseStyle fixed)
// --------------------------------------------------------------------------
const menuHelper   = createMultiStyleConfigHelpers(['button','list','item','groupTitle','command','divider'])
const Menu         = menuHelper.defineMultiStyleConfig({
  baseStyle: menuHelper.definePartsStyle({
    list:{ bg:'surface', border:'1px solid', borderColor:'border.base', py:1, minW:'10rem', boxShadow:'md' },
    item:{ px:3, py:2, cursor:'pointer', _hover:{ bg:'interaction.hover' }, _focus:{ bg:'interaction.active' }, _disabled:{ color:'text.muted', cursor:'not-allowed' }},
  })
})

const tabsHelper   = createMultiStyleConfigHelpers(['root','tablist','tab','tabpanel','indicator'])
const Tabs         = tabsHelper.defineMultiStyleConfig({
  baseStyle: tabsHelper.definePartsStyle({
    tablist: { borderBottom:'1px solid', borderColor:'border.base' },
    tab:     { px:4, py:2, fontWeight:'medium', _selected:{ color:'brand.600', borderColor:'brand.600', borderBottom:'2px solid' }},
    tabpanel:{ p:4 },
  }),
})

const alertHelper  = createMultiStyleConfigHelpers(['container','title','description','icon'])
const Alert        = alertHelper.defineMultiStyleConfig({
  baseStyle: alertHelper.definePartsStyle(() => ({
    container:{ w:'100%', borderRadius:'md', display:'flex', alignItems:'center', gap:3, py:3, px:4 },
    title:{ fontWeight:'bold', mr:2 },
    description:{ flex:1 },
    icon:{ mr:3 },
  })),
  variants: {
    subtle: alertHelper.definePartsStyle(({ colorScheme='info' }) => ({
      container:{ bg:`${colorScheme}.50`, color:`${colorScheme}.700`, _dark:{ bg:`${colorScheme}.800`, color:`${colorScheme}.200`} }
    })),
    solid:  alertHelper.definePartsStyle(({ colorScheme='info' }) => ({
      container:{ bg:`${colorScheme}.500`, color:'white', _dark:{ bg:`${colorScheme}.500`, color:'white'} }
    })),
  },
  defaultProps:{ variant:'subtle' },
})

const tagHelper    = createMultiStyleConfigHelpers(['container','label','closeButton'])
const Tag          = tagHelper.defineMultiStyleConfig({
  baseStyle: tagHelper.definePartsStyle({ container:{ fontWeight:'medium', borderRadius:'sm' }}),
  sizes: {
    sm: tagHelper.definePartsStyle({ container:{ fontSize:'xs', px:2, py:1 }}),
    md: tagHelper.definePartsStyle({ container:{ fontSize:'sm', px:3, py:1 }}),
  },
  variants: {
    solid:  c=>tagHelper.definePartsStyle({ container:{ bg:`${c}.500`, color:'white' }}),
    subtle: c=>tagHelper.definePartsStyle({ container:{ bg:`${c}.100`, color:`${c}.700` }}),
  },
  defaultProps:{ size:'md', variant:'solid', colorScheme:'brand' },
})

const badgeHelper  = createMultiStyleConfigHelpers(['label'])
const Badge        = badgeHelper.defineMultiStyleConfig({
  baseStyle: badgeHelper.definePartsStyle({ label:{ fontSize:'0.75rem', fontWeight:'bold', px:2, py:1, borderRadius:'full' }}),
  variants: {
    solid:   c=>badgeHelper.definePartsStyle({ label:{ bg:`${c}.600`, color:'white' }}),
    outline: c=>badgeHelper.definePartsStyle({ label:{ border:'1px solid', borderColor:`${c}.500`, color:`${c}.500` }}),
  },
  defaultProps:{ variant:'solid', colorScheme:'brand' },
})

const cardHelper   = createMultiStyleConfigHelpers(['container','header','body','footer'])
const Card         = cardHelper.defineMultiStyleConfig({
  baseStyle: cardHelper.definePartsStyle({ container:{ bg:'elevated', boxShadow:'md', borderRadius:'container', p:4 }}),
  variants: {
    elevated: cardHelper.definePartsStyle({ container:{ boxShadow:'lg' }}),
    outlined: cardHelper.definePartsStyle({ container:{ border:'1px solid', borderColor:'border.base' }}),
  },
  defaultProps:{ variant:'elevated' },
})

const switchHelper = createMultiStyleConfigHelpers(['container','track','thumb'])
const Switch       = switchHelper.defineMultiStyleConfig({
  baseStyle: switchHelper.definePartsStyle({
    track:{ bg:'neutral.300', _checked:{ bg:'brand.500' }},
    thumb:{ bg:'white', boxSize:4, _checked:{ transform:'translateX(1rem)' }},
  }),
})

// --------------------------------------------------------------------------
// 5. Final Assembly
// --------------------------------------------------------------------------
const theme = extendTheme({
  config,
  breakpoints,
  colors,
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
  styles: globalStyles,
  components: {
    Menu,
    Tabs,
    Alert,
    Tag,
    Badge,
    Card,
    Switch,
  },
})

export type Theme = typeof theme
export default theme
