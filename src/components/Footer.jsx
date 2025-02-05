const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex space-x-3 mb-4">
              <img
                src="/src/assets/Logo/logo.png"
                alt="ShinobiPath Logo"
                className="h-10 bg-[#13fa6f5f] p-1 rounded-3xl"
              />
              <h3 className="text-white font-bold text-3xl mb-4">ShinobiPath</h3>
            </div>
            <p className="text-sm">
              Making travel planning simple and enjoyable for everyone.
            </p>
          </div>
          {footerLinks.map((section, index) => (
            <div key={index}>
              <h4 className="text-white font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link, i) => (
                  <li key={i}>
                    <a
                      href="#"
                      className="text-sm hover:text-white transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
};

const footerLinks = [
  {
    title: "Company",
    links: ["About Us", "Careers", "Press", "Contact"],
  },
  {
    title: "Resources",
    links: ["Blog", "Help Center", "Community", "Partners"],
  },
  {
    title: "Legal",
    links: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
  },
];

export default Footer;
