const grid = 20;

module.exports = {
  uiGrid: `${grid}px`,
  uiFontFamily: 'sans-serif',
  uiFontSize: '16px',
  uiBaseTransition: 'cubic-bezier(0.66, 0, 0.07, 1)',
  uiBaseTransitionDuration: '300ms',
  uiPopTransition: 'cubic-bezier(0.66, 0, 0.07, 1)',
  uiPopTransitionDuration: '300ms',
  uiBgColor: '#000',
  uiColor: '#fff',
  uiErrorColor: '#D52917',
  uiBgFocusColor: '#222',
  uiFocusColor: '#ddd',
  uiActiveColor: '#00f',

  // input
  uiInputUppercase: true,
  uiInputHover: true,

  // calendar
  uiCalendarCellHeight: `${grid}px`,
  uiCalendarPadding: `${grid / 4}px`,
  uiCalendarUppercase: true
}
