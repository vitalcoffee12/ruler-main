import { href, Link, useNavigate } from "react-router";
import logoDark from "./logo-dark.svg";
import logoLight from "./logo-light.png";
import welcomImage from "./welcome-image.png";
import { ActionButton, SubmitButton } from "~/components/forms";

export default function Welcome() {
  const nav = useNavigate();
  return (
    <main className="w-full">
      {/** Header */}
      <Link to="/" className="w-44 h-24 fixed flex items-center px-6">
        <img
          src={logoLight}
          alt="React Router"
          className="block w-full dark:hidden"
        />
        <img
          src={logoDark}
          alt="React Router"
          className="hidden w-full dark:block"
        />
      </Link>
      <div className="w-44 h-24 fixed flex items-center justify-end px-6 right-0">
        <ActionButton
          label="Sign In"
          onClick={() => {
            nav("auth/signin");
          }}
          style={{
            fontSize: "16px",
            padding: "8px 16px",
            borderRadius: "30px",
          }}
        />
      </div>
      {/** GNB */}
      <nav className="flex justify-center border-b border-stone-200 dark:border-stone-700 h-24">
        <ul className="flex h-full items-center gap-6 px-4">
          {resources.map(({ href, text, icon }) => (
            <Link key={href} to={href}>
              <div className="group flex items-center gap-3 self-stretch py-2 px-4 leading-normal text-stone-900 hover:bg-stone-100 rounded-lg">
                <span className="material-symbols-outlined">{icon}</span>
                {text}
              </div>
            </Link>
          ))}
        </ul>
      </nav>
      {/** Main */}
      <div className="max-w-5xl mx-auto mt-16 mb-12 relative px-4">
        <div className="whitespace-pre-wrap text-4xl font-bold text-left m-9">
          {message}
        </div>
        <div className="w-full">
          <img
            src={welcomImage}
            alt="Welcome Illustration"
            className="w-full mx-auto mt-8"
          />
        </div>
        <div className="flex justify-center gap-5 mt-12">
          <SubmitButton
            label="How It Works"
            style={{
              fontSize: "16px",
              padding: "8px 16px",
              borderRadius: "30px",
            }}
            onClick={() => {
              nav("guides");
            }}
          />
          <SubmitButton
            label="Create Your World"
            style={{
              backgroundColor: "var(--color-lime-400)",
              fontSize: "16px",
              padding: "8px 16px",
              borderRadius: "30px",
            }}
            onClick={() => {
              nav("auth/signup");
            }}
          />
        </div>
        {/** Features */}
        <div className="flex flex-col gap-4 mt-20 px-3">
          {features.map(({ title, description, icon }) => (
            <div
              key={title}
              className="p-6 border border-stone-200 dark:border-stone-700 rounded-lg"
            >
              <div className="flex items-center mb-4">
                <span className="material-symbols-outlined text-3xl text-stone-700 mr-4">
                  {icon}
                </span>
                <h3 className="text-xl font-semibold text-stone-900">
                  {title}
                </h3>
              </div>
              <p className="text-stone-600 whitespace-pre-wrap">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
      {/** Footer */}
      <div className="px-4">
        <footer className="mx-auto flex flex-col  justify-center items-center border-t border-stone-200 dark:border-stone-700 mb-12">
          <div className="w-full max-w-5xl mt-6 mb-6 flex justify-between px-4 flex-wrap">
            <div>
              <div className="text-stone-600 mb-4">
                <img src={logoLight} alt="Ruler Logo" />
              </div>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-6 mb-4 ">
              {footerLinks.map((section) => (
                <li key={section.title}>
                  <h4 className="text-stone-400 mb-6 text-sm px-1">
                    {section.title}
                  </h4>
                  <ul>
                    {section.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          to={link.href}
                          className="text-stone-600 hover:text-stone-900 text-sm block py-2 px-1 mb-1"
                        >
                          {link.text}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
          <span className="text-sm text-stone-500 mt-12">
            © 2026 Ruler. All rights reserved.
          </span>
        </footer>
      </div>
    </main>
  );
}

const message = "AI Game Master.\nLeave it to Me, and Just Play.";

const resources = [
  {
    href: "guides",
    text: "Guides",
    icon: "menu_book",
  },
  {
    href: "game",
    text: "Blog",
    icon: "tooltip",
  },
  {
    href: "support",
    text: "Support",
    icon: "emergency",
  },
  {
    href: "launcher",
    text: "Launcher",
    icon: "rocket_launch",
  },
  {
    href: "community",
    text: "Community",
    icon: "groups",
  },
];

const features = [
  {
    title: "Easy to Start",
    description:
      "Tired with heavy rules?\nGet started quickly with our user-friendly interface and intuitive controls.",
    icon: "rocket_launch",
  },
  {
    title: "AI-Powered Gameplay",
    description:
      "Experience dynamic and engaging gameplay driven by advanced AI technology.\nAI master ready to adapt and respond to your actions in real-time.",
    icon: "smart_toy",
  },
  {
    title: "Customizable",
    description:
      "Create and explore unique worlds tailored to your preferences and imagination.\nImport own rules and settings to make the game truly for your teams.",
    icon: "map",
  },
];

const footerLinks = [
  {
    title: "Company",
    links: [
      { href: "/about", text: "About Us" },
      { href: "/contact", text: "Contact Us" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/guides", text: "Guides" },
      { href: "/support", text: "Support" },
      { href: "/pricing", text: "Pricing" },
      { href: "/community", text: "Community" },
      { href: "/blog", text: "Blog" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/terms", text: "Terms of Service" },
      { href: "/privacy", text: "Privacy Policy" },
      { href: "/acknowledgements", text: "Acknowledgements" },
    ],
  },
];
