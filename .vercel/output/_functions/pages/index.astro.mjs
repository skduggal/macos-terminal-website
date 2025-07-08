import { c as createAstro, a as createComponent, r as renderTemplate, b as renderComponent, u as unescapeHTML, F as Fragment, e as addAttribute, f as renderHead, g as renderSlot } from '../chunks/astro/server_CZfNvfgM.mjs';
import 'kleur/colors';
/* empty css                                 */
import { escape } from 'html-escaper';
import { c as getImage } from '../chunks/_astro_assets_DSscLqBP.mjs';
import { jsxs, Fragment as Fragment$1, jsx } from 'react/jsx-runtime';
import { useState, useEffect, useRef } from 'react';
import { MdWifi } from 'react-icons/md';
import { FaApple, FaFilePdf } from 'react-icons/fa';
import { IoCellular, IoBatteryHalfOutline, IoSearchSharp } from 'react-icons/io5';
import { VscVscode } from 'react-icons/vsc';
import { FaRegFolderClosed } from 'react-icons/fa6';
import { BsGithub, BsSpotify, BsLinkedin } from 'react-icons/bs';
import { IoIosCall, IoIosMail } from 'react-icons/io';
import { RiTerminalFill } from 'react-icons/ri';
export { renderers } from '../renderers.mjs';

const createMetaTag = (attributes) => {
  const attrs = Object.entries(attributes).map(([key, value]) => `${key}="${escape(value)}"`).join(" ");
  return `<meta ${attrs}>`;
};
const createLinkTag = (attributes) => {
  const attrs = Object.entries(attributes).map(([key, value]) => `${key}="${escape(value)}"`).join(" ");
  return `<link ${attrs}>`;
};
const createOpenGraphTag = (property, content) => {
  return createMetaTag({ property: `og:${property}`, content });
};
const buildOpenGraphMediaTags = (mediaType, media) => {
  let tags = "";
  const addTag = (tag) => {
    tags += tag + "\n";
  };
  media.forEach((medium) => {
    addTag(createOpenGraphTag(mediaType, medium.url));
    if (medium.alt) {
      addTag(createOpenGraphTag(`${mediaType}:alt`, medium.alt));
    }
    if (medium.secureUrl) {
      addTag(createOpenGraphTag(`${mediaType}:secure_url`, medium.secureUrl));
    }
    if (medium.type) {
      addTag(createOpenGraphTag(`${mediaType}:type`, medium.type));
    }
    if (medium.width) {
      addTag(createOpenGraphTag(`${mediaType}:width`, medium.width.toString()));
    }
    if (medium.height) {
      addTag(
        createOpenGraphTag(`${mediaType}:height`, medium.height.toString())
      );
    }
  });
  return tags;
};
const buildTags = (config) => {
  let tagsToRender = "";
  const addTag = (tag) => {
    tagsToRender += tag + "\n";
  };
  if (config.title) {
    const formattedTitle = config.titleTemplate ? config.titleTemplate.replace("%s", config.title) : config.title;
    addTag(`<title>${escape(formattedTitle)}</title>`);
  }
  if (config.description) {
    addTag(createMetaTag({ name: "description", content: config.description }));
  }
  let robotsContent = [];
  if (typeof config.noindex !== "undefined") {
    robotsContent.push(config.noindex ? "noindex" : "index");
  }
  if (typeof config.nofollow !== "undefined") {
    robotsContent.push(config.nofollow ? "nofollow" : "follow");
  }
  if (config.robotsProps) {
    const {
      nosnippet,
      maxSnippet,
      maxImagePreview,
      noarchive,
      unavailableAfter,
      noimageindex,
      notranslate
    } = config.robotsProps;
    if (nosnippet) robotsContent.push("nosnippet");
    if (typeof maxSnippet === "number") robotsContent.push(`max-snippet:${maxSnippet}`);
    if (maxImagePreview)
      robotsContent.push(`max-image-preview:${maxImagePreview}`);
    if (noarchive) robotsContent.push("noarchive");
    if (unavailableAfter)
      robotsContent.push(`unavailable_after:${unavailableAfter}`);
    if (noimageindex) robotsContent.push("noimageindex");
    if (notranslate) robotsContent.push("notranslate");
  }
  if (robotsContent.length > 0) {
    addTag(createMetaTag({ name: "robots", content: robotsContent.join(",") }));
  }
  if (config.canonical) {
    addTag(createLinkTag({ rel: "canonical", href: config.canonical }));
  }
  if (config.mobileAlternate) {
    addTag(
      createLinkTag({
        rel: "alternate",
        media: config.mobileAlternate.media,
        href: config.mobileAlternate.href
      })
    );
  }
  if (config.languageAlternates && config.languageAlternates.length > 0) {
    config.languageAlternates.forEach((languageAlternate) => {
      addTag(
        createLinkTag({
          rel: "alternate",
          hreflang: languageAlternate.hreflang,
          href: languageAlternate.href
        })
      );
    });
  }
  if (config.openGraph) {
    const title = config.openGraph?.title || config.title;
    if (title) {
      addTag(createOpenGraphTag("title", title));
    }
    const description = config.openGraph?.description || config.description;
    if (description) {
      addTag(createOpenGraphTag("description", description));
    }
    if (config.openGraph.url) {
      addTag(createOpenGraphTag("url", config.openGraph.url));
    }
    if (config.openGraph.type) {
      addTag(createOpenGraphTag("type", config.openGraph.type));
    }
    if (config.openGraph.images && config.openGraph.images.length) {
      addTag(buildOpenGraphMediaTags("image", config.openGraph.images));
    }
    if (config.openGraph.videos && config.openGraph.videos.length) {
      addTag(buildOpenGraphMediaTags("video", config.openGraph.videos));
    }
    if (config.openGraph.locale) {
      addTag(createOpenGraphTag("locale", config.openGraph.locale));
    }
    if (config.openGraph.site_name) {
      addTag(createOpenGraphTag("site_name", config.openGraph.site_name));
    }
    if (config.openGraph.profile) {
      if (config.openGraph.profile.firstName) {
        addTag(
          createOpenGraphTag(
            "profile:first_name",
            config.openGraph.profile.firstName
          )
        );
      }
      if (config.openGraph.profile.lastName) {
        addTag(
          createOpenGraphTag(
            "profile:last_name",
            config.openGraph.profile.lastName
          )
        );
      }
      if (config.openGraph.profile.username) {
        addTag(
          createOpenGraphTag(
            "profile:username",
            config.openGraph.profile.username
          )
        );
      }
      if (config.openGraph.profile.gender) {
        addTag(
          createOpenGraphTag("profile:gender", config.openGraph.profile.gender)
        );
      }
    }
    if (config.openGraph.book) {
      if (config.openGraph.book.authors && config.openGraph.book.authors.length) {
        config.openGraph.book.authors.forEach((author) => {
          addTag(createOpenGraphTag("book:author", author));
        });
      }
      if (config.openGraph.book.isbn) {
        addTag(createOpenGraphTag("book:isbn", config.openGraph.book.isbn));
      }
      if (config.openGraph.book.releaseDate) {
        addTag(
          createOpenGraphTag(
            "book:release_date",
            config.openGraph.book.releaseDate
          )
        );
      }
      if (config.openGraph.book.tags && config.openGraph.book.tags.length) {
        config.openGraph.book.tags.forEach((tag) => {
          addTag(createOpenGraphTag("book:tag", tag));
        });
      }
    }
    if (config.openGraph.article) {
      if (config.openGraph.article.publishedTime) {
        addTag(
          createOpenGraphTag(
            "article:published_time",
            config.openGraph.article.publishedTime
          )
        );
      }
      if (config.openGraph.article.modifiedTime) {
        addTag(
          createOpenGraphTag(
            "article:modified_time",
            config.openGraph.article.modifiedTime
          )
        );
      }
      if (config.openGraph.article.expirationTime) {
        addTag(
          createOpenGraphTag(
            "article:expiration_time",
            config.openGraph.article.expirationTime
          )
        );
      }
      if (config.openGraph.article.authors && config.openGraph.article.authors.length) {
        config.openGraph.article.authors.forEach((author) => {
          addTag(createOpenGraphTag("article:author", author));
        });
      }
      if (config.openGraph.article.section) {
        addTag(
          createOpenGraphTag(
            "article:section",
            config.openGraph.article.section
          )
        );
      }
      if (config.openGraph.article.tags && config.openGraph.article.tags.length) {
        config.openGraph.article.tags.forEach((tag) => {
          addTag(createOpenGraphTag("article:tag", tag));
        });
      }
    }
    if (config.openGraph.video) {
      if (config.openGraph.video.actors && config.openGraph.video.actors.length) {
        config.openGraph.video.actors.forEach((actor) => {
          addTag(createOpenGraphTag("video:actor", actor.profile));
          if (actor.role) {
            addTag(createOpenGraphTag("video:actor:role", actor.role));
          }
        });
      }
      if (config.openGraph.video.directors && config.openGraph.video.directors.length) {
        config.openGraph.video.directors.forEach((director) => {
          addTag(createOpenGraphTag("video:director", director));
        });
      }
      if (config.openGraph.video.writers && config.openGraph.video.writers.length) {
        config.openGraph.video.writers.forEach((writer) => {
          addTag(createOpenGraphTag("video:writer", writer));
        });
      }
      if (config.openGraph.video.duration) {
        addTag(
          createOpenGraphTag(
            "video:duration",
            config.openGraph.video.duration.toString()
          )
        );
      }
      if (config.openGraph.video.releaseDate) {
        addTag(
          createOpenGraphTag(
            "video:release_date",
            config.openGraph.video.releaseDate
          )
        );
      }
      if (config.openGraph.video.tags && config.openGraph.video.tags.length) {
        config.openGraph.video.tags.forEach((tag) => {
          addTag(createOpenGraphTag("video:tag", tag));
        });
      }
      if (config.openGraph.video.series) {
        addTag(
          createOpenGraphTag("video:series", config.openGraph.video.series)
        );
      }
    }
  }
  if (config.facebook && config.facebook.appId) {
    addTag(
      createMetaTag({ property: "fb:app_id", content: config.facebook.appId })
    );
  }
  if (config.twitter) {
    if (config.twitter.cardType) {
      addTag(
        createMetaTag({
          name: "twitter:card",
          content: config.twitter.cardType
        })
      );
    }
    if (config.twitter.site) {
      addTag(
        createMetaTag({ name: "twitter:site", content: config.twitter.site })
      );
    }
    if (config.twitter.handle) {
      addTag(
        createMetaTag({
          name: "twitter:creator",
          content: config.twitter.handle
        })
      );
    }
  }
  if (config.additionalMetaTags && config.additionalMetaTags.length > 0) {
    config.additionalMetaTags.forEach((metaTag) => {
      const attributes = {
        content: metaTag.content
      };
      if ("name" in metaTag && metaTag.name) {
        attributes.name = metaTag.name;
      } else if ("property" in metaTag && metaTag.property) {
        attributes.property = metaTag.property;
      } else if ("httpEquiv" in metaTag && metaTag.httpEquiv) {
        attributes["http-equiv"] = metaTag.httpEquiv;
      }
      addTag(createMetaTag(attributes));
    });
  }
  if (config.additionalLinkTags && config.additionalLinkTags.length > 0) {
    config.additionalLinkTags.forEach((linkTag) => {
      const attributes = {
        rel: linkTag.rel,
        href: linkTag.href
      };
      if (linkTag.sizes) {
        attributes.sizes = linkTag.sizes;
      }
      if (linkTag.media) {
        attributes.media = linkTag.media;
      }
      if (linkTag.type) {
        attributes.type = linkTag.type;
      }
      if (linkTag.color) {
        attributes.color = linkTag.color;
      }
      if (linkTag.as) {
        attributes.as = linkTag.as;
      }
      if (linkTag.crossOrigin) {
        attributes.crossorigin = linkTag.crossOrigin;
      }
      addTag(createLinkTag(attributes));
    });
  }
  return tagsToRender.trim();
};

const $$Astro$2 = createAstro("https://example.com");
const $$AstroSeo = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$AstroSeo;
  const {
    title,
    titleTemplate,
    noindex,
    nofollow,
    robotsProps,
    description,
    canonical,
    mobileAlternate,
    languageAlternates,
    openGraph,
    facebook,
    twitter,
    additionalMetaTags,
    additionalLinkTags
  } = Astro2.props;
  return renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result2) => renderTemplate`${unescapeHTML(buildTags({
    title,
    titleTemplate,
    noindex,
    nofollow,
    robotsProps,
    description,
    canonical,
    mobileAlternate,
    languageAlternates,
    openGraph,
    facebook,
    twitter,
    additionalMetaTags,
    additionalLinkTags
  }))}` })}`;
}, "/Users/sidkduggal/Documents/Code/sids-terminal-site/macos-terminal-portfolio/node_modules/@astrolib/seo/src/AstroSeo.astro", undefined);

const macBackground1 = new Proxy({"src":"/_astro/mac-background1.BN3pAP-K.jpg","width":6016,"height":3384,"format":"jpg","orientation":1}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "/Users/sidkduggal/Documents/Code/sids-terminal-site/macos-terminal-portfolio/src/assets/images/mac-background1.jpg";
							}
							
							return target[name];
						}
					});

const macBackground2 = new Proxy({"src":"/_astro/mac-background2.DAWzICtV.jpg","width":6016,"height":3384,"format":"jpg","orientation":1}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "/Users/sidkduggal/Documents/Code/sids-terminal-site/macos-terminal-portfolio/src/assets/images/mac-background2.jpg";
							}
							
							return target[name];
						}
					});

const macBackground3 = new Proxy({"src":"/_astro/mac-background3.D2uWT5Yk.jpg","width":6016,"height":3384,"format":"jpg","orientation":1}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "/Users/sidkduggal/Documents/Code/sids-terminal-site/macos-terminal-portfolio/src/assets/images/mac-background3.jpg";
							}
							
							return target[name];
						}
					});

const $$Astro$1 = createAstro("https://example.com");
const $$BaseHead = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$BaseHead;
  const backgrounds = await Promise.all([
    getImage({ src: macBackground1, width: 3500 }),
    getImage({ src: macBackground2, width: 3500 }),
    getImage({ src: macBackground3, width: 3500 })
  ]);
  return renderTemplate`<!-- Core meta tags --><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"><meta name="author" content="Siddhanth Duggal"><!-- Replace with your name --><!-- SEO Configuration - customize these values -->${renderComponent($$result, "AstroSeo", $$AstroSeo, { "title": Astro2.props.title || "Siddhanth Duggal - Statistics + Biochem @ UBC", "description": Astro2.props.description || "Problem-solving through data-driven technological innovation, with a deep focus on AI.", "canonical": Astro2.props.canonical || "https://sidkd.com", "openGraph": {
    url: Astro2.props.openGraph?.url || "https://sidkd.com",
    title: Astro2.props.openGraph?.title || "Siddhanth Duggal - Statistics + Biochem @ UBC",
    description: Astro2.props.openGraph?.description || "Problem-solving through data-driven technological innovation, with a deep focus on AI.",
    images: [
      {
        url: ""
        // og image here
      }
    ],
    site_name: Astro2.props.openGraph?.site_name || "Siddhanth Duggal"
  } })}<!-- Add your favicon files in public/images/ --><link rel="apple-touch-icon" sizes="180x180" href="/images/YOUR_FAVICON.svg"><link rel="icon" type="image/png" sizes="32x32" href="/images/YOUR_FAVICON.svg"><link rel="icon" type="image/png" sizes="16x16" href="/images/YOUR_FAVICON.svg"><!-- Theme colors for browsers --><meta name="msapplication-TileColor" content="YOUR_COLOR_HEX"><meta name="theme-color" content="YOUR_COLOR_HEX"><!-- Auto-generated sitemap --><link rel="sitemap" href="/sitemap-index.xml"><!-- Preload background images for performance -->${backgrounds.map((bg) => renderTemplate`<link rel="preload"${addAttribute(bg.src, "href")} as="image" type="image/webp" fetchpriority="high">`)}`;
}, "/Users/sidkduggal/Documents/Code/sids-terminal-site/macos-terminal-portfolio/src/components/global/BaseHead.astro", undefined);

const $$Astro = createAstro("https://example.com");
const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Layout;
  return renderTemplate`<html lang="en" class="scroll-smooth selection:bg-gray-900 selection:text-white overflow-x-hidden"> <head>${renderComponent($$result, "BaseHead", $$BaseHead, { "title": Astro2.props.title, "description": Astro2.props.description, "canonical": Astro2.props.canonical, "openGraph": Astro2.props.openGraph })}${renderHead()}</head> <body class="overflow-x-hidden bg-gray-900"> ${renderSlot($$result, $$slots["default"])} </body></html>`;
}, "/Users/sidkduggal/Documents/Code/sids-terminal-site/macos-terminal-portfolio/src/layouts/Layout.astro", undefined);

function MacToolbar() {
  const [currentDateTime, setCurrentDateTime] = useState(/* @__PURE__ */ new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(/* @__PURE__ */ new Date());
    }, 6e4);
    return () => clearInterval(timer);
  }, []);
  const formatMacDate = (date) => {
    const weekday = date.toLocaleString("en-US", {
      weekday: "short",
      timeZone: "America/Vancouver"
    });
    const month = date.toLocaleString("en-US", {
      month: "short",
      timeZone: "America/Vancouver"
    });
    const day = date.getDate();
    const hour = date.toLocaleString("en-US", {
      hour: "numeric",
      hour12: true,
      timeZone: "America/Vancouver"
    });
    const minute = date.toLocaleString("en-US", {
      minute: "2-digit",
      timeZone: "America/Vancouver"
    });
    const period = date.getHours() >= 12 ? "PM" : "AM";
    return `${weekday} ${month} ${day} ${hour.replace(
      /\s?[AP]M/,
      ""
    )}:${minute} ${period}`;
  };
  const formatIPhoneTime = (date) => {
    let hour = date.getHours();
    const minute = date.getMinutes().toString().padStart(2, "0");
    hour = hour % 12;
    hour = hour ? hour : 12;
    return `${hour}:${minute}`;
  };
  const handleVSCodeClick = () => {
    window.location.href = "vscode:/";
  };
  return /* @__PURE__ */ jsxs(Fragment$1, { children: [
    /* @__PURE__ */ jsxs("div", { className: "sticky top-0 z-50 md:hidden bg-transparent text-white h-12 px-8 flex items-center justify-between text-base font-medium", children: [
      /* @__PURE__ */ jsx("span", { className: "font-semibold", children: formatIPhoneTime(currentDateTime) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsx(IoCellular, { size: 20 }),
        /* @__PURE__ */ jsx(MdWifi, { size: 20 }),
        /* @__PURE__ */ jsx(IoBatteryHalfOutline, { size: 24 })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "sticky top-0 z-50 hidden md:flex bg-black/20 backdrop-blur-md text-white h-6 px-4 items-center justify-between text-sm", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-4", children: [
        /* @__PURE__ */ jsx(FaApple, { size: 16 }),
        /* @__PURE__ */ jsx("span", { className: "font-semibold cursor-default", children: "Siddhanth Duggal" }),
        /* @__PURE__ */ jsx("span", { className: "cursor-default", children: "File" }),
        /* @__PURE__ */ jsx("span", { className: "cursor-default", children: "Edit" }),
        /* @__PURE__ */ jsx("span", { className: "cursor-default", children: "View" }),
        /* @__PURE__ */ jsx("span", { className: "cursor-default", children: "Go" }),
        /* @__PURE__ */ jsx("span", { className: "cursor-default", children: "Window" }),
        /* @__PURE__ */ jsx("span", { className: "cursor-default", children: "Help" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-4", children: [
        /* @__PURE__ */ jsx(
          VscVscode,
          {
            size: 16,
            className: "cursor-default hover:opacity-80 transition-opacity",
            onClick: handleVSCodeClick,
            title: "Open in VSCode"
          }
        ),
        /* @__PURE__ */ jsx(MdWifi, { size: 16 }),
        /* @__PURE__ */ jsx(IoSearchSharp, { size: 16 }),
        /* @__PURE__ */ jsxs("span", { className: "cursor-default", children: [
          formatMacDate(currentDateTime),
          " | Vancouver, BC"
        ] })
      ] })
    ] })
  ] });
}

const PLACEHOLDER_MESSAGES = [
  "Type your question...",
  "Tell me about yourself?",
  "What's your work experience?",
  "What are your skills?",
  "What projects have you worked on?"
];
function MacTerminal() {
  const [chatHistory, setChatHistory] = useState({
    messages: [],
    input: ""
  });
  const [isTyping, setIsTyping] = useState(false);
  const [placeholder, setPlaceholder] = useState("");
  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const messagesEndRef = useRef(null);
  useEffect(() => {
    let timeout;
    const currentMessage = PLACEHOLDER_MESSAGES[currentPlaceholderIndex];
    const animatePlaceholder = () => {
      if (isDeleting) {
        if (placeholder.length === 0) {
          setIsDeleting(false);
          setCurrentPlaceholderIndex(
            (prev) => (prev + 1) % PLACEHOLDER_MESSAGES.length
          );
          timeout = setTimeout(animatePlaceholder, 400);
        } else {
          setPlaceholder((prev) => prev.slice(0, -1));
          timeout = setTimeout(animatePlaceholder, 80);
        }
      } else {
        if (placeholder.length === currentMessage.length) {
          timeout = setTimeout(() => setIsDeleting(true), 1500);
        } else {
          setPlaceholder(currentMessage.slice(0, placeholder.length + 1));
          timeout = setTimeout(animatePlaceholder, 120);
        }
      }
    };
    timeout = setTimeout(animatePlaceholder, 100);
    return () => clearTimeout(timeout);
  }, [placeholder, isDeleting, currentPlaceholderIndex]);
  const welcomeMessage = `Welcome to My Portfolio

Name: Siddhanth Duggal

Hey! I'm a Statistics and Biochemistry student at the University of British Columbia, with a deep focus in artificial intelligence and the design of data-driven systems.

This LLM-powered portfolio website blends my interest in AI architectures (like RAG pipelines) with design-forward development.

Ask me anything!
`;
  const currentDate = /* @__PURE__ */ new Date();
  currentDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });
  useEffect(() => {
    setChatHistory((prev) => ({
      ...prev,
      messages: [
        ...prev.messages,
        { role: "assistant", content: welcomeMessage }
      ]
    }));
  }, []);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory.messages]);
  const handleInputChange = (e) => {
    setChatHistory((prev) => ({ ...prev, input: e.target.value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const userInput = chatHistory.input.trim();
    if (!userInput) return;
    setChatHistory((prev) => ({
      messages: [...prev.messages, { role: "user", content: userInput }],
      input: ""
    }));
    setIsTyping(true);
    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ question: userInput })
      });
      if (!response.ok) throw new Error("Failed to get response");
      const data = await response.json();
      setChatHistory((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          { role: "assistant", content: data.answer }
        ]
      }));
    } catch (error) {
      setChatHistory((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            role: "assistant",
            content: "I'm having trouble processing that. Please email me at sidkduggal@gmail.com"
          }
        ]
      }));
    } finally {
      setIsTyping(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "bg-black/75 w-[600px] h-[400px] rounded-lg overflow-hidden shadow-lg mx-4 sm:mx-0", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 h-6 flex items-center space-x-2 px-4", children: [
      /* @__PURE__ */ jsx("div", { className: "w-3 h-3 rounded-full bg-red-500" }),
      /* @__PURE__ */ jsx("div", { className: "w-3 h-3 rounded-full bg-yellow-500" }),
      /* @__PURE__ */ jsx("div", { className: "w-3 h-3 rounded-full bg-green-500" }),
      /* @__PURE__ */ jsxs("span", { className: "text-sm text-gray-300 flex-grow text-center font-semibold flex items-center justify-center gap-2", children: [
        /* @__PURE__ */ jsx(FaRegFolderClosed, { size: 14, className: "text-gray-300" }),
        "sidkd.com ⸺ zsh"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-4 text-gray-200 font-mono text-xs h-[calc(400px-1.5rem)] flex flex-col", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-y-auto overflow-x-hidden", children: [
        chatHistory.messages.map((msg, index) => /* @__PURE__ */ jsx("div", { className: "mb-2", children: msg.role === "user" ? /* @__PURE__ */ jsxs("div", { className: "flex items-start space-x-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-green-400 flex-shrink-0", children: ">" }),
          /* @__PURE__ */ jsx("pre", { className: "whitespace-pre-wrap break-words overflow-hidden flex-1", children: msg.content })
        ] }) : /* @__PURE__ */ jsx("pre", { className: "whitespace-pre-wrap break-words overflow-hidden", children: msg.content }) }, index)),
        isTyping && /* @__PURE__ */ jsx("div", { className: "animate-pulse", children: "..." }),
        /* @__PURE__ */ jsx("div", { ref: messagesEndRef })
      ] }),
      /* @__PURE__ */ jsx("form", { onSubmit: handleSubmit, className: "mt-2", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2", children: [
        /* @__PURE__ */ jsx("span", { className: "whitespace-nowrap", children: "sidkduggal@gmail.com root %" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: chatHistory.input,
            onChange: handleInputChange,
            className: "w-full sm:flex-1 bg-transparent outline-none text-white placeholder-gray-400",
            placeholder
          }
        )
      ] }) })
    ] })
  ] });
}

function MobileDock() {
  const handleEmailClick = () => {
    window.location.href = "mailto:sidkduggal@gmail.com";
  };
  const handleGithubClick = () => {
    window.open("https://github.com/sidkduggal", "_blank");
  };
  const handleSpotifyClick = () => {
    window.open("https://open.spotify.com", "_blank");
  };
  return /* @__PURE__ */ jsx("div", { className: "fixed bottom-0 left-0 right-0 md:hidden", children: /* @__PURE__ */ jsxs("div", { className: "mx-4 mb-4 p-3 bg-gradient-to-t from-gray-700 to-gray-800 backdrop-blur-xl rounded-3xl flex justify-around items-center max-w-[400px] mx-auto", children: [
    /* @__PURE__ */ jsx("a", { href: "tel:+17783255927", className: "flex flex-col items-center", children: /* @__PURE__ */ jsx("div", { className: "w-18 h-18 bg-gradient-to-t from-green-600 to-green-400 rounded-2xl flex items-center justify-center", children: /* @__PURE__ */ jsx(IoIosCall, { size: 60, className: "text-white" }) }) }),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: handleEmailClick,
        className: "flex flex-col items-center cursor-pointer",
        children: /* @__PURE__ */ jsx("div", { className: "w-18 h-18 bg-gradient-to-t from-blue-600 to-blue-400 rounded-2xl flex items-center justify-center", children: /* @__PURE__ */ jsx(IoIosMail, { size: 60, className: "text-white" }) })
      }
    ),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: handleGithubClick,
        className: "flex flex-col items-center cursor-pointer",
        children: /* @__PURE__ */ jsx("div", { className: "w-18 h-18 bg-gradient-to-t from-black to-black/60 rounded-2xl flex items-center justify-center", children: /* @__PURE__ */ jsx(BsGithub, { size: 55, className: "text-white" }) })
      }
    ),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: handleSpotifyClick,
        className: "flex flex-col items-center cursor-pointer",
        children: /* @__PURE__ */ jsx("div", { className: "w-18 h-18 bg-gradient-to-t from-black to-black/60 rounded-2xl flex items-center justify-center", children: /* @__PURE__ */ jsx(BsSpotify, { size: 55, className: "text-[#1ED760]" }) })
      }
    )
  ] }) });
}

function DesktopDock() {
  const [hoveredIcon, setHoveredIcon] = useState(null);
  const handleResumeClick = () => {
    window.open("/resume.pdf", "_blank");
  };
  const handleLinkedInClick = () => {
    window.open("https://www.linkedin.com/in/sidkduggal/", "_blank");
  };
  const handleEmailClick = () => {
    window.location.href = "mailto:sidkduggal@gmail.com";
  };
  const handleGithubClick = () => {
    window.open("https://github.com/skduggal", "_blank");
  };
  const handleCalendarClick = () => {
    window.open("https://calendar.app.google/EWnsvXq4RHBfiMg79", "_blank");
  };
  const handleAppleMusicClick = () => {
    window.open("https://music.apple.com/ca/playlist/my-playlist-10/pl.u-LdbqelvIxVorK1G", "_blank");
  };
  const Tooltip = ({ text }) => /* @__PURE__ */ jsx("div", { className: "absolute -top-14 left-1/2 -translate-x-1/2", children: /* @__PURE__ */ jsxs("div", { className: "relative px-3 py-1 bg-[#1d1d1f]/80 backdrop-blur-sm text-white text-sm rounded-lg whitespace-nowrap border border-px border-gray-600", children: [
    text,
    /* @__PURE__ */ jsx("div", { className: "absolute left-1/2 -translate-x-1/2 -bottom-[7px] w-3 h-3 bg-[#1d1d1f]/80 backdrop-blur-sm rotate-45 border-b border-r border-gray-600" })
  ] }) });
  return /* @__PURE__ */ jsx("div", { className: "fixed bottom-0 left-1/2 -translate-x-1/2 hidden md:block z-50", children: /* @__PURE__ */ jsx("div", { className: "relative mb-2 p-3 bg-gradient-to-t from-gray-700 to-gray-800 backdrop-blur-2xl rounded-2xl", children: /* @__PURE__ */ jsxs("div", { className: "flex items-end space-x-4", children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: handleResumeClick,
        onMouseEnter: () => setHoveredIcon("resume"),
        onMouseLeave: () => setHoveredIcon(null),
        className: "relative",
        children: [
          /* @__PURE__ */ jsx("div", { className: "w-14 h-14 bg-gradient-to-t from-red-600 to-red-500 rounded-xl flex items-center justify-center shadow-lg", children: /* @__PURE__ */ jsx(FaFilePdf, { size: 38, className: "text-white" }) }),
          hoveredIcon === "resume" && /* @__PURE__ */ jsx(Tooltip, { text: "Sid's Resume" })
        ]
      }
    ),
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: handleLinkedInClick,
        onMouseEnter: () => setHoveredIcon("linkedin"),
        onMouseLeave: () => setHoveredIcon(null),
        className: "relative",
        children: [
          /* @__PURE__ */ jsx("div", { className: "w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg", children: /* @__PURE__ */ jsx(BsLinkedin, { size: 40, className: "text-white" }) }),
          hoveredIcon === "linkedin" && /* @__PURE__ */ jsx(Tooltip, { text: "LinkedIn" })
        ]
      }
    ),
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: handleEmailClick,
        onMouseEnter: () => setHoveredIcon("email"),
        onMouseLeave: () => setHoveredIcon(null),
        className: "relative",
        children: [
          /* @__PURE__ */ jsx("div", { className: "w-14 h-14 bg-gradient-to-t from-blue-600 to-blue-400 rounded-xl flex items-center justify-center shadow-lg", children: /* @__PURE__ */ jsx(IoIosMail, { size: 45, className: "text-white" }) }),
          hoveredIcon === "email" && /* @__PURE__ */ jsx(Tooltip, { text: "Email Me" })
        ]
      }
    ),
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: handleGithubClick,
        onMouseEnter: () => setHoveredIcon("github"),
        onMouseLeave: () => setHoveredIcon(null),
        className: "relative",
        children: [
          /* @__PURE__ */ jsx("div", { className: "w-14 h-14 bg-gradient-to-t from-black to-black/60 rounded-xl flex items-center justify-center shadow-lg", children: /* @__PURE__ */ jsx(BsGithub, { size: 45, className: "text-gray-100" }) }),
          hoveredIcon === "github" && /* @__PURE__ */ jsx(Tooltip, { text: "My GitHub" })
        ]
      }
    ),
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: handleCalendarClick,
        onMouseEnter: () => setHoveredIcon("calendar"),
        onMouseLeave: () => setHoveredIcon(null),
        className: "relative",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "w-14 h-14 overflow-hidden shadow-lg", children: [
            /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-white to-gray-200 rounded-xl" }),
            /* @__PURE__ */ jsx("div", { className: "absolute top-0 inset-x-0 h-5 bg-red-500 flex items-center justify-center rounded-t-xl", children: /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-white uppercase", children: (/* @__PURE__ */ new Date()).toLocaleString("en-US", { month: "short" }) }) }),
            /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-end justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-3xl font-light text-black", children: (/* @__PURE__ */ new Date()).getDate() }) })
          ] }),
          hoveredIcon === "calendar" && /* @__PURE__ */ jsx(Tooltip, { text: "Book a Call" })
        ]
      }
    ),
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: handleAppleMusicClick,
        onMouseEnter: () => setHoveredIcon("applemusic"),
        onMouseLeave: () => setHoveredIcon(null),
        className: "relative",
        children: [
          /* @__PURE__ */ jsx("div", { className: "w-14 h-14 bg-gradient-to-t from-black to-gray-800 rounded-xl flex items-center justify-center shadow-lg", children: /* @__PURE__ */ jsx(FaApple, { size: 40, className: "text-white" }) }),
          hoveredIcon === "applemusic" && /* @__PURE__ */ jsx(Tooltip, { text: "Apple Music" })
        ]
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "flex items-center", children: /* @__PURE__ */ jsx("div", { className: "w-px h-14 bg-white/20" }) }),
    /* @__PURE__ */ jsxs(
      "button",
      {
        onMouseEnter: () => setHoveredIcon("terminal"),
        onMouseLeave: () => setHoveredIcon(null),
        className: "relative",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "w-14 h-14 rounded-2xl overflow-hidden shadow-lg", children: [
            /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-gray-300 to-gray-500 rounded-xl" }),
            /* @__PURE__ */ jsx("div", { className: "absolute inset-[2px] rounded-xl bg-black", children: /* @__PURE__ */ jsx("div", { className: "absolute top-1 left-2", children: /* @__PURE__ */ jsx(RiTerminalFill, { size: 20, className: "text-white" }) }) })
          ] }),
          hoveredIcon === "terminal" && /* @__PURE__ */ jsx(Tooltip, { text: "Terminal" })
        ]
      }
    )
  ] }) }) });
}

function Desktop({ initialBg, backgroundMap }) {
  const [currentBg, setCurrentBg] = useState(initialBg);
  useEffect(() => {
    const lastBg = localStorage.getItem("lastBackground");
    if (lastBg === initialBg) {
      const bgKeys = Object.keys(backgroundMap);
      const availableBgs = bgKeys.filter((bg) => bg !== lastBg);
      const newBg = availableBgs[Math.floor(Math.random() * availableBgs.length)];
      setCurrentBg(newBg);
    }
    localStorage.setItem("lastBackground", currentBg);
  }, [initialBg, backgroundMap]);
  return /* @__PURE__ */ jsxs("div", { className: "relative w-screen h-screen overflow-hidden", children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "absolute inset-0 bg-cover bg-center",
        style: { backgroundImage: `url(${backgroundMap[currentBg]})` }
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "relative z-10", children: /* @__PURE__ */ jsx(MacToolbar, {}) }),
    /* @__PURE__ */ jsx("div", { className: "relative z-0 flex items-center justify-center h-[calc(100vh-10rem)] md:h-[calc(100vh-1.5rem)] pt-6", children: /* @__PURE__ */ jsx(MacTerminal, {}) }),
    /* @__PURE__ */ jsx(MobileDock, {}),
    /* @__PURE__ */ jsx(DesktopDock, {})
  ] });
}

const $$LandingPage = createComponent(async ($$result, $$props, $$slots) => {
  const backgrounds = [macBackground1, macBackground2, macBackground3];
  function getRandomBackground() {
    return `bg-${Math.floor(Math.random() * backgrounds.length) + 1}`;
  }
  const optimizedBackgrounds = await Promise.all(
    backgrounds.map(
      (bg) => getImage({
        src: bg,
        width: 3500
      })
    )
  );
  const backgroundMap = Object.fromEntries(
    optimizedBackgrounds.map((bg, index) => [`bg-${index + 1}`, bg.src])
  );
  return renderTemplate`${renderComponent($$result, "AppLayout", Desktop, { "client:load": true, "initialBg": getRandomBackground(), "backgroundMap": backgroundMap, "client:component-hydration": "load", "client:component-path": "/Users/sidkduggal/Documents/Code/sids-terminal-site/macos-terminal-portfolio/src/layouts/AppLayout", "client:component-export": "default" })}`;
}, "/Users/sidkduggal/Documents/Code/sids-terminal-site/macos-terminal-portfolio/src/components/LandingPage.astro", undefined);

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`<!-- 
  Customize these values for your portfolio:
  - title: Your name and role
  - description: Brief description of your expertise
  - canonical: Your website URL
  - openGraph: Social media sharing metadata
-->${renderComponent($$result, "Layout", $$Layout, { "title": "Siddhanth Duggal - Statistics @ UBC", "description": "Statistics and Biochemistry student at UBC with a focus on AI and data-driven systems", "canonical": "https://sidkd.com", "openGraph": {
    url: "https://sidkd.com",
    title: "Siddhanth Duggal - Statistics & Biochemistry Student",
    description: "Statistics and Biochemistry student at UBC with a focus on AI and data-driven systems",
    site_name: "Siddhanth Duggal"
  } }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "LandingPage", $$LandingPage, {})} ` })}`;
}, "/Users/sidkduggal/Documents/Code/sids-terminal-site/macos-terminal-portfolio/src/pages/index.astro", undefined);

const $$file = "/Users/sidkduggal/Documents/Code/sids-terminal-site/macos-terminal-portfolio/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
