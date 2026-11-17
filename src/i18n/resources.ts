export const resources = {
  zh: {
    translation: {
      config: {
        title: "警灯设置",
        subtitle: "选择灯光颜色与闪烁规范",
        red: "红灯",
        blue: "蓝灯",
        standard: "闪烁规范",
        start: "开始闪烁",
        note: "轻触屏幕可显示停止按钮",
        nightHint: "夜间使用建议将屏幕亮度调至最高",
      },
      standards: {
        gb: {
          name: "国标",
          detail: "GB 13954 · 红蓝交替单闪，约 2 次/秒",
        },
        us: {
          name: "美标",
          detail: "SAE J845 · 红蓝交替双闪，约 1 组/秒",
        },
        eu: {
          name: "欧标",
          detail: "ECE R65 · 红蓝交替单闪，约 2.5 次/秒",
        },
      },
      stop: "停止",
      language: {
        switch: "English",
        aria: "切换语言",
      },
    },
  },
  en: {
    translation: {
      config: {
        title: "Siren settings",
        subtitle: "Choose the light colours and flash pattern",
        red: "Red light",
        blue: "Blue light",
        standard: "Flash standard",
        start: "Start flashing",
        note: "Tap the screen to reveal the stop button.",
        nightHint: "For night use, set the screen to maximum brightness",
      },
      standards: {
        gb: {
          name: "Chinese · GB",
          detail: "GB 13954 · alternating single flash, about 2 per second",
        },
        us: {
          name: "American · SAE",
          detail: "SAE J845 · alternating double flash, about 1 burst per second",
        },
        eu: {
          name: "European · ECE",
          detail: "ECE R65 · alternating single flash, about 2.5 per second",
        },
      },
      stop: "Stop",
      language: {
        switch: "中文",
        aria: "Switch language",
      },
    },
  },
} as const;
