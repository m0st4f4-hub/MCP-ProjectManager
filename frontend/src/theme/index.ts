import {
  extendTheme,
  ThemeConfig,
  defineStyleConfig,
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
  brand:   {50:'#EBF8FF',100:'#BEE3F8',200:'#90CDF4',300:'#63B3ED',400:'#4299E1',500:'#3182CE',600:'#2B6CB0',700:'#2C5282',800:'#2A4365',900:'#1A365D'},
  neutral: {50:'#F7FAFC',100:'#EDF2F7',200:'#E2E8F0',300:'#CBD5E0',400:'#A0AEC0',500:'#718096',600:'#4A5568',700:'#2D3748',800:'#1A202C',900:'#171923'},
  accent:  {50:'#E6FFFA',100:'#B2F5EA',200:'#81E6D9',300:'#4FD1C5',400:'#38B2AC',500:'#319795',600:'#2C7A7B',700:'#285E61',800:'#234E52',900:'#1D4044'},
  success: {50:'#F0FFF4',100:'#C6F6D5',200:'#9AE6B4',300:'#68D391',400:'#48BB78',500:'#38A169',600:'#2F855A',700:'#276749',800:'#22543D',900:'#1C4532'},
  warning: {50:'#FFFBEB',100:'#FEF3C7',200:'#FDE68A',300:'#FCD34D',400:'#FBBF24',500:'#F59E0B',600:'#D97706',700:'#B45309',800:'#92400E',900:'#78350F'},
  danger:  {50:'#FFF5F5',100:'#FED7D7',200:'#FEB2B2',300:'#FC8181',400:'#F56565',500:'#E53E3E',600:'#C53030',700:'#9B2C2C',800:'#822727',900:'#63171B'},
  info:    {50:'#EBFBFF',100:'#B3F5FF',200:'#80F0FF',300:'#4DEBFF',400:'#22E0FF',500:'#00D5FF',600:'#00A8CC',700:'#007F99',800:'#005566',900:'#002C33'},
  purple:  {50:'#FAF5FF',100:'#E9D8FD',200:'#D6BCFA',300:'#B794F4',400:'#9F7AEA',500:'#805AD5',600:'#6B46C1',700:'#553C9A',800:'#44337A',900:'#322659'},
  whiteAlpha: {
    50: 'rgba(255,255,255,0.04)',
    100:'rgba(255,255,255,0.06)',
    200:'rgba(255,255,255,0.08)',
    300:'rgba(255,255,255,0.16)',
    400:'rgba(255,255,255,0.24)',
    500:'rgba(255,255,255,0.36)',
    600:'rgba(255,255,255,0.48)',
    700:'rgba(255,255,255,0.64)',
    800:'rgba(255,255,255,0.80)',
    900:'rgba(255,255,255,0.92)',
  },
  blackAlpha: {
    50: 'rgba(0,0,0,0.04)',
    100:'rgba(0,0,0,0.06)',
    200:'rgba(0,0,0,0.08)',
    300:'rgba(0,0,0,0.16)',
    400:'rgba(0,0,0,0.24)',
    500:'rgba(0,0,0,0.36)',
    600:'rgba(0,0,0,0.48)',
    700:'rgba(0,0,0,0.64)',
    800:'rgba(0,0,0,0.80)',
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

const space = {
  px:'1px', 0:'0', 0.5:'0.125rem', 1:'0.25rem', 1.5:'0.375rem', 2:'0.5rem', 2.5:'0.625rem',
  3:'0.75rem',3.5:'0.875rem',4:'1rem',5:'1.25rem',6:'1.5rem',7:'1.75rem',8:'2rem',9:'2.25rem',
  10:'2.5rem',12:'3rem',14:'3.5rem',16:'4rem',20:'5rem',24:'6rem',32:'8rem',
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

const zIndices = {
  hide:-1, auto:'auto', base:0, docked:10, dropdown:1000, sticky:1100, banner:1200,
  overlay:1300, modal:1400, popover:1500, tooltip:1600,
}

const shadows = {
  xs:'0 0 0 1px rgba(0,0,0,0.05)',
  sm:'0 1px 2px 0 rgba(0,0,0,0.05)',
  md:'0 4px 6px -1px rgba(0,0,0,0.1),0 2px 4px -1px rgba(0,0,0,0.06)',
  lg:'0 10px 15px -3px rgba(0,0,0,0.1),0 4px 6px -2px rgba(0,0,0,0.05)',
  xl:'0 20px 25px -5px rgba(0,0,0,0.1),0 10px 10px -5px rgba(0,0,0,0.04)',
  outline:'0 0 0 3px var(--eg-colors-brand-300)',
  inner:'inset 0 2px 4px 0 rgba(0,0,0,0.06)',
}

const opacity = {
  '0':'0','10':'0.1','20':'0.2','30':'0.3','40':'0.4','50':'0.5','60':'0.6','70':'0.7','80':'0.8','90':'0.9','100':'1',
}

const blur = {
  none:'0', sm:'blur(4px)', md:'blur(8px)', lg:'blur(16px)', xl:'blur(24px)',
}

const filters = {
  none:'none', grayscale:'grayscale(100%)', sepia:'sepia(100%)', invert:'invert(100%)',
}

const motion = {
  duration:{ ultrafast:'50ms', faster:'100ms', fast:'150ms', normal:'200ms', slow:'300ms', slower:'400ms', ultraslow:'500ms' },
  timing:{ in:'cubic-bezier(0.4,0,1,1)', out:'cubic-bezier(0,0,0.2,1)', 'in-out':'cubic-bezier(0.4,0,0.2,1)' },
  property:{ common:'background-color,border-color,color,transform,opacity,box-shadow' },
  reduced:'@media (prefers-reduced-motion: reduce)',
}

// --------------------------------------------------------------------------
// 2. Semantic Tokens
// --------------------------------------------------------------------------
const semanticTokens = {
  colors: {
    'bg.app':       { default: 'white',       _dark: 'neutral.900' },
    'bg.surface':   { default: 'neutral.50',  _dark: 'neutral.800' },
    'bg.elevated':  { default: 'white',       _dark: 'neutral.700' },
    'text.base':    { default: 'neutral.700', _dark: 'neutral.100' },
    'text.muted':   { default: 'neutral.500', _dark: 'neutral.400' },
    'text.link':    { default: 'brand.600',   _dark: 'brand.300' },
    'border.base':  { default: 'neutral.200', _dark: 'neutral.700' },
    'border.focus': { default: 'brand.500',   _dark: 'brand.300' },
    'shadow.base':  { default: 'md',          _dark: 'md' },
    'radius.base':  { default: 'md' },
    'interaction.hover':    { default: 'neutral.100',   _dark: 'whiteAlpha.100' },
    'interaction.active':   { default: 'neutral.200',   _dark: 'whiteAlpha.200' },
    'interaction.disabled': { default: 'neutral.100',   _dark: 'whiteAlpha.100' },
    'status.success': { default: 'success.500', _dark: 'success.300' },
    'status.warning': { default: 'warning.500', _dark: 'warning.300' },
    'status.error':   { default: 'danger.500',  _dark: 'danger.300' },
    'status.info':    { default: 'info.500',    _dark: 'info.300' },
    'bg.status.success.subtle': { default: 'success.50', _dark: 'success.800' },
    'text.status.success':    { default: 'success.700', _dark: 'success.200' },
    'bg.status.info.subtle':    { default: 'info.50', _dark: 'info.800' },
    'text.status.info':       { default: 'info.700', _dark: 'info.200' },
    'zIndices.dropdown': { default: 'dropdown' },
    'zIndices.modal':    { default: 'modal' },
    'zIndices.tooltip':  { default: 'tooltip' },
    'bg.page':            { default: 'neutral.50',    _dark: 'neutral.900' },
    'bg.header':          { default: 'neutral.100',   _dark: 'neutral.700' },
    'bg.sidebar':         { default: 'neutral.100',   _dark: 'neutral.700' },
    'bg.content':         { default: 'white',         _dark: 'neutral.800' },
    'bg.card':            { default: 'white',         _dark: 'neutral.700' },
    'bg.modal':           { default: 'neutral.50',    _dark: 'neutral.800' },
    'bg.input':           { default: 'white',         _dark: 'neutral.700' },
    'bg.button.primary':  { default: 'brand.500',     _dark: 'brand.500' },
    'bg.button.primary.hover': { default: 'brand.600', _dark: 'brand.400' },
    'bg.button.secondary':{ default: 'neutral.100',   _dark: 'neutral.600' },
    'bg.button.accent':   { default: 'accent.500',    _dark: 'accent.500' },
    'bg.button.accent.hover': { default: 'accent.600', _dark: 'accent.400' },
    'bg.button.action':   { default: 'info.500',      _dark: 'info.300' },
    'bg.button.danger':   { default: 'danger.500',    _dark: 'danger.500' },
    'bg.button.danger.hover': { default: 'red.600', _dark: 'red.400' },
    'bg.hover.nav':       { default: 'neutral.100',   _dark: 'neutral.700' },
    'bg.active.nav':      { default: 'brand.50',      _dark: 'brand.700' },
    'bg.subtle':          { default: 'neutral.50',    _dark: 'neutral.800' },
    'bg.accent.subtle':   { default: 'accent.50',     _dark: 'accent.800' },
    'bg.tooltip':         { default: 'neutral.800',   _dark: 'neutral.600' },
    'bg.focus':           { default: 'rgba(66, 153, 225, 0.6)', _dark: 'rgba(66, 153, 225, 0.6)' },
    'bg.danger.hover':    { default: 'red.100',       _dark: 'rgba(229, 62, 62, 0.2)' },
    'bg.danger.subtle':   { default: 'red.50',        _dark: 'rgba(229, 62, 62, 0.1)' },
    'text.primary':       { default: 'neutral.900',   _dark: 'whiteAlpha.900' },
    'text.secondary':     { default: 'neutral.600',   _dark: 'neutral.400' },
    'text.placeholder':   { default: 'neutral.400',   _dark: 'neutral.400' },
    'text.heading':       { default: 'neutral.900',   _dark: 'whiteAlpha.900' },
    'text.inverted':      { default: 'white',         _dark: 'neutral.900' },
    'text.button.primary':{ default: 'white',         _dark: 'white' },
    'text.button.secondary':{ default: 'neutral.800', _dark: 'whiteAlpha.900' },
    'text.accent':        { default: 'accent.600',    _dark: 'accent.300' },
    'text.button.accent': { default: 'white',         _dark: 'neutral.900' },
    'text.disabled':      { default: 'neutral.400',   _dark: 'neutral.400' },
    'text.critical':      { default: 'red.600',       _dark: 'red.300' },
    'text.danger':        { default: 'red.500',       _dark: 'red.300' },
    'border.modal':       { default: 'neutral.200',   _dark: 'neutral.700' },
    'button.hover.secondary': { default: 'neutral.200', _dark: 'whiteAlpha.200' },
    'text.button.action': { default: 'white',         _dark: 'neutral.900' },
    border: {
      primary:    { default: 'neutral.300', _dark: 'neutral.600' },
      secondary:  { default: 'neutral.200', _dark: 'neutral.600' },
      divider:    { default: 'neutral.200', _dark: 'neutral.600' },
      input:      { default: 'neutral.300', _dark: 'neutral.600' },
      input_hover:{ default: 'neutral.400', _dark: 'neutral.500' },
      subtle:     { default: 'neutral.400', _dark: 'neutral.500' },
      danger:     { default: 'red.200',     _dark: 'red.400' },
      accent:     { default: 'accent.500',  _dark: 'accent.300' },
      focus:      { default: 'blue.500',    _dark: 'blue.300' },
      checkbox:   { default: 'neutral.300', _dark: 'neutral.600' },
      'checkbox.checked': { default: 'green.500', _dark: 'green.300' },
    },
    icon: {
      default:    { default: 'neutral.500', _dark: 'neutral.400' },
      primary:    { default: 'brand.500',   _dark: 'brand.300' },
      secondary:  { default: 'neutral.400', _dark: 'neutral.500' },
      hover:      { default: 'brand.600',   _dark: 'brand.200' },
      disabled:   { default: 'neutral.300', _dark: 'neutral.600' },
      inverted:   { default: 'whiteAlpha.900', _dark: 'neutral.900' },
      accent:     { default: 'accent.500',  _dark: 'accent.300' },
      active:     { default: 'brand.500',   _dark: 'brand.300' },
      stat: {
        project:  { default: 'purple.500', _dark: 'purple.300' },
        task:     { default: 'teal.500',   _dark: 'teal.300' },
        agent:    { default: 'orange.500', _dark: 'orange.300' },
        completed:{ default: 'green.500',  _dark: 'green.300' },
        pending:  { default: 'yellow.500', _dark: 'yellow.400' },
      },
      focus:      { default: 'blue.500',    _dark: 'blue.300' },
      checkbox:   { default: 'neutral.300', _dark: 'neutral.600' },
      checkbox_checked: { default: 'green.500', _dark: 'green.300' },
    },
    accent: {
      active:     { default: 'accent.500',  _dark: 'accent.300' },
    },
    'task.item.bg':           { default: 'white',         _dark: 'neutral.700' },
    'task.item.completed.bg': { default: 'neutral.50',    _dark: 'neutral.800' },
    'task.item.flash.bg':     { default: 'yellow.100',    _dark: 'yellow.700' },
    'bg.checkbox.checked': { default: 'green.500', _dark: 'green.300' },
  },
  space, sizes, radii, shadows, zIndices, opacity, blur, filters,
  motion, fontSizes, fontWeights, lineHeights, letterSpacings, fonts,
}

// --------------------------------------------------------------------------
// 3. Global Styles & Accessibility
// --------------------------------------------------------------------------
const styles = {
  global:(props:StyleFunctionProps)=>({
    'html, body':{
      bg:'bg.app', color:'text.base',
      fontFamily:'body', lineHeight:'normal',
      height:'100%', width:'100%', overflowX:'hidden',
    },
    a:{
      color:'text.link', textDecoration:'none',
      transition:`color ${motion.duration.fast} ${motion.timing.out}`,
      _hover:{ textDecoration:'underline' },
      _focusVisible:{ boxShadow:'outline', outline:'none' },
    },
    '*:focus-visible':{ boxShadow:'outline', outline:'none' },
    '::selection':{ bg:'accent.300', color:'white' },
    '*,*::before,*::after':{ boxSizing:'border-box' },
    '::-webkit-scrollbar':{ width:'8px',height:'8px' },
    '::-webkit-scrollbar-track':{ bg:'surface', borderRadius:'full' },
    '::-webkit-scrollbar-thumb':{ bg:'border.base', borderRadius:'full', '&:hover':{ bg:'neutral.400' }},
  })
}

// --------------------------------------------------------------------------
// 4. Component Recipes
// --------------------------------------------------------------------------
const menuHelper = createMultiStyleConfigHelpers(['button', 'list', 'item', 'groupTitle', 'command', 'divider'])
const Menu = menuHelper.defineMultiStyleConfig({
  baseStyle: menuHelper.definePartsStyle({
    list:{ bg:'surface', border:'1px solid', borderColor:'border.base', py:1, minW:'10rem', boxShadow:'md' },
    item:{ px:3, py:2, cursor:'pointer', _hover:{ bg:'interaction.hover' }, _focus:{ bg:'interaction.active' }, _disabled:{ color:'text.muted', cursor:'not-allowed' }},
  }),
})

const tabsHelper = createMultiStyleConfigHelpers(['root', 'tablist', 'tab', 'tabpanel', 'indicator'])
const Tabs = tabsHelper.defineMultiStyleConfig({
  baseStyle: tabsHelper.definePartsStyle({
    tablist:{ borderBottom:'1px solid', borderColor:'border.base' },
    tab:{ px:4, py:2, fontWeight:'medium', _selected:{ color:'brand.600', borderColor:'brand.600', borderBottom:'2px solid' }},
    tabpanel:{ p:4 },
  }),
})

const alertHelper = createMultiStyleConfigHelpers(['container', 'title', 'description', 'icon', 'spinner'])
const Alert = alertHelper.defineMultiStyleConfig({
  baseStyle: alertHelper.definePartsStyle(({ colorScheme })=>({
    container:{ w:'100%', borderRadius:'md', display:'flex', alignItems:'center', gap:3, py:3, px:4 },
    title:{ fontWeight:'bold', mr:2 },
    description:{ flex:1 },
    icon:{ mr:3 },
  })),
  variants:{
    subtle: alertHelper.definePartsStyle(({ colorScheme = 'info' }) => ({
      container: { bg: `${colorScheme}.50`, color: `${colorScheme}.700`, _dark: { bg: `${colorScheme}.800`, color: `${colorScheme}.200`} }
    })),
    solid:  alertHelper.definePartsStyle(({ colorScheme = 'info' }) => ({
      container: { bg: `${colorScheme}.500`, color: 'white', _dark: { bg: `${colorScheme}.500`, color: 'white'} }
    })),
  },
  defaultProps:{ variant:'subtle' },
})

const tagHelper = createMultiStyleConfigHelpers(['container', 'label', 'closeButton'])
const Tag = tagHelper.defineMultiStyleConfig({
  baseStyle: tagHelper.definePartsStyle({ container:{ fontWeight:'medium', borderRadius:'sm' }}),
  sizes:{
    sm: tagHelper.definePartsStyle({ container:{ fontSize:'xs', px:2, py:1 }}),
    md: tagHelper.definePartsStyle({ container:{ fontSize:'sm', px:3, py:1 }}),
  },
  variants:{
    solid:  colorScheme=>tagHelper.definePartsStyle({ container:{ bg:`${colorScheme}.500`, color:'white' }}),
    subtle: colorScheme=>tagHelper.definePartsStyle({ container:{ bg:`${colorScheme}.100`, color:`${colorScheme}.700` }}),
  },
  defaultProps:{ size:'md', variant:'solid', colorScheme:'brand' },
})

const badgeHelper = createMultiStyleConfigHelpers(['label'])
const Badge = badgeHelper.defineMultiStyleConfig({
  baseStyle: badgeHelper.definePartsStyle({ label:{ fontSize:'0.75rem', fontWeight:'bold', px:2, py:1, borderRadius:'full' }}),
  variants:{
    solid:   colorScheme=>badgeHelper.definePartsStyle({ label:{ bg:`${colorScheme}.600`, color:'white' }}),
    outline: colorScheme=>badgeHelper.definePartsStyle({ label:{ border:'1px solid', borderColor:`${colorScheme}.500`, color:`${colorScheme}.500` }}),
  },
  defaultProps:{ variant:'solid', colorScheme:'brand' },
})

const cardHelper = createMultiStyleConfigHelpers(['container', 'header', 'body', 'footer'])
const Card = cardHelper.defineMultiStyleConfig({
  baseStyle: cardHelper.definePartsStyle({ container:{ bg:'elevated', boxShadow:'md', borderRadius:'container', p:4 }}),
  variants:{
    elevated: cardHelper.definePartsStyle({ container:{ boxShadow:'lg' }}),
    outlined: cardHelper.definePartsStyle({ container:{ border:'1px solid', borderColor:'border.base' }}),
  },
  defaultProps:{ variant:'elevated' },
})

const switchHelper = createMultiStyleConfigHelpers(['container', 'track', 'thumb'])
const Switch = switchHelper.defineMultiStyleConfig({
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
  semanticTokens: {
    colors: { ...semanticTokens.colors },
    space,
    sizes,
    radii,
    shadows,
    zIndices,
    opacity,
    blur,
    filters,
    motion: { ...semanticTokens.motion },
    fontSizes,
    fontWeights,
    lineHeights,
    letterSpacings,
    fonts,
  },
  styles,
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
