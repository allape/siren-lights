export const resources = {
  zh: {
    translation: {
      config: {
        title: "警灯设置",
        subtitle: "选择灯光颜色与闪烁规范",
        red: "红灯",
        blue: "蓝灯",
        standard: "闪烁规范",
        redPresets: "红灯预设颜色",
        bluePresets: "蓝灯预设颜色",
        start: "开始闪烁",
        note: "轻触屏幕可显示停止按钮",
        nightHint: "夜间使用建议将屏幕亮度调至最高",
      },
      presets: {
        white: "纯白",
        approx: "屏幕近似色",
        red: {
          pure: "纯红",
          gb: "国标红",
          us: "美标红",
          eu: "欧标红",
        },
        blue: {
          pure: "纯蓝",
          gb: "国标蓝",
          us: "美标蓝",
          eu: "欧标蓝",
        },
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
      pwa: {
        install: "安装到桌面",
        iosHint: "在分享菜单中选择“添加到主屏幕”，即可像应用一样全屏使用。",
      },
    },
  },
  en: {
    translation: {
      config: {
        title: "Siren settings",
        subtitle: "Colours and flash pattern",
        red: "Red light",
        blue: "Blue light",
        standard: "Flash standard",
        redPresets: "Red light presets",
        bluePresets: "Blue light presets",
        start: "Start flashing",
        note: "Tap the screen to reveal the stop button.",
        nightHint: "For night use, set the screen to maximum brightness",
      },
      presets: {
        white: "White",
        approx: "screen approximation",
        red: {
          pure: "Red",
          gb: "GB red",
          us: "US red",
          eu: "EU red",
        },
        blue: {
          pure: "Blue",
          gb: "GB blue",
          us: "US blue",
          eu: "EU blue",
        },
      },
      standards: {
        gb: {
          name: "Chinese · GB",
          detail: "GB 13954 · single flash at 2 Hz",
        },
        us: {
          name: "American · SAE",
          detail: "SAE J845 · double flash at 1 Hz",
        },
        eu: {
          name: "European · ECE",
          detail: "ECE R65 · single flash at 2.5 Hz",
        },
      },
      stop: "Stop",
      language: {
        switch: "中文",
        aria: "Switch language",
      },
      pwa: {
        install: "Install app",
        iosHint:
          "Choose “Add to Home Screen” from the share menu to use it full screen, like an app.",
      },
    },
  },
} as const;
