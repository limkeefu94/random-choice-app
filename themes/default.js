(function () {
  const softPngTheme = {
    id: "soft-png",
    label: "Soft PNG theme",
    labelKey: "theme.softPng",
    assets: {
      icons: {
        app: "./assets/icons/app-icon.png",
      },
      modes: {
        food: "./assets/modes/mode-food.png",
        drink: "./assets/modes/mode-drink.png",
        travel: "./assets/modes/mode-travel.png",
        number: "./assets/modes/mode-number.png",
        shopping: "./assets/modes/mode-shopping.png",
        gift: "./assets/modes/mode-gift.png",
        custom: "./assets/modes/mode-custom.png",
        world: "./assets/modes/mode-world.png",
      },
      empty: {
        favorites: "./assets/empty/empty-favorites.png",
        history: "./assets/empty/empty-history.png",
        notification: "./assets/empty/empty-notification.png",
        options: "./assets/empty/empty-options.png",
        world: "./assets/empty/empty-world.png",
      },
      gift: {
        box: "./assets/gift/gift-box.png",
        nameCard: "./assets/gift/name-card.png",
      },
      social: {
        defaultAvatar: "./assets/social/default-avatar.png",
        heartPopSprite: "./assets/social/heart-pop-sprite.png",
        uploadImage: "./assets/social/upload-image.png",
      },
      ui: {
        leafAccent: "./assets/ui/leaf-accent.png",
        notificationBell: "./assets/ui/notification-bell.png",
        wheelPointer: "./assets/ui/wheel-pointer.png",
        buttonIcons: {
          close: "./assets/ui/button-icons/close.png",
          edit: "./assets/ui/button-icons/edit.png",
          menu: "./assets/ui/button-icons/menu.png",
          copy: "./assets/ui/button-icons/copy.png",
          share: "./assets/ui/button-icons/share.png",
          trash: "./assets/ui/button-icons/trash.png",
          cancel: "./assets/ui/button-icons/cancel.png",
          confirm: "./assets/ui/button-icons/confirm.png",
          refresh: "./assets/ui/button-icons/refresh.png",
          shuffle: "./assets/ui/button-icons/shuffle.png",
          hide: "./assets/ui/button-icons/hide.png",
          tools: "./assets/ui/button-icons/tools.png",
        },
      },
    },
    cssVars: {
      "--asset-wheel-pointer": "url('./assets/ui/wheel-pointer.png')",
      "--asset-leaf-accent": "url('./assets/ui/leaf-accent.png')",
      "--asset-heart-pop-sprite": "url('./assets/social/heart-pop-sprite.png')",
    },
  };

  window.APP_DEFAULT_THEME_ID = "soft-png";
  window.APP_THEMES = Object.freeze({
    "soft-png": Object.freeze(softPngTheme),
  });
})();
