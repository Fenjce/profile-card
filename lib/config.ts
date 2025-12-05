import { ProfileConfig } from "./types";

export const profileConfig: ProfileConfig = {
  user: {
    name: "null",
    title: "Lỏ Developer",
    content:
      "A kiddo who love to code and often do things that no one asks me to do but I find fun.",
    avatar:
      "https://i.pinimg.com/1200x/3c/67/75/3c67757cef723535a7484a6c7bfbfc43.jpg",
  },

  information: [
    {
      label: "Email",
      value: "@gmail.com",
      type: "email",
    },
    {
      label: "Số điện thoại",
      value: "+84 123 456 789",
      type: "phone",
    },
    {
      label: "Địa chỉ",
      value: "Hà Nội, Việt Nam",
      type: "address",
    },
  ],

  social: [
    {
      name: "Facebook",
      url: "https://facebook.com/yourprofile",
      icon: "facebook",
    },
    {
      name: "Instagram",
      url: "https://instagram.com/yourprofile",
      icon: "instagram",
    },
    {
      name: "Discord",
      url: "https://discord.com/yourprofile",
      icon: "discord",
    },
    {
      name: "GitHub",
      url: "https://github.com/yourprofile",
      icon: "github",
    },
  ],

  admin: {
    username: "admin",
    password: "admin",
  },

  stories: [],
};
