"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const qwik = require("@builder.io/qwik");
const jsxRuntime = require("@builder.io/qwik/jsx-runtime");
const build = require("@builder.io/qwik/build");
const _qwikCityPlan = require("@qwik-city-plan");
const swRegister = require("@qwik-city-sw-register");
const zod = require("zod");
const RouteStateContext = /* @__PURE__ */ qwik.createContext("qc-s");
const ContentContext = /* @__PURE__ */ qwik.createContext("qc-c");
const ContentInternalContext = /* @__PURE__ */ qwik.createContext("qc-ic");
const DocumentHeadContext = /* @__PURE__ */ qwik.createContext("qc-h");
const RouteLocationContext = /* @__PURE__ */ qwik.createContext("qc-l");
const RouteNavigateContext = /* @__PURE__ */ qwik.createContext("qc-n");
const RouteActionContext = /* @__PURE__ */ qwik.createContext("qc-a");
const RouterOutlet = /* @__PURE__ */ qwik.componentQrl(qwik.inlinedQrl(() => {
  const context = qwik.useContext(ContentInternalContext);
  if (context.value && context.value.length > 0) {
    const contentsLen = context.value.length;
    let cmp = null;
    for (let i = contentsLen - 1; i >= 0; i--)
      cmp = qwik.jsx(context.value[i].default, {
        children: cmp,
        [qwik._IMMUTABLE]: {
          children: false
        }
      });
    return cmp;
  }
  return qwik.SkipRender;
}, "RouterOutlet_component_AKetNByE5TM"));
const Content = RouterOutlet;
const MODULE_CACHE = /* @__PURE__ */ new WeakMap();
const POPSTATE_FALLBACK_INITIALIZED = /* @__PURE__ */ Symbol();
const CLIENT_HISTORY_INITIALIZED = /* @__PURE__ */ Symbol();
const CLIENT_DATA_CACHE = /* @__PURE__ */ new Map();
const QACTION_KEY = "qaction";
const loadRoute = async (routes, menus, cacheModules, pathname) => {
  if (Array.isArray(routes))
    for (const route of routes) {
      const match = route[0].exec(pathname);
      if (match) {
        const loaders = route[1];
        const params = getPathParams(route[2], match);
        const routeBundleNames = route[4];
        const mods = new Array(loaders.length);
        const pendingLoads = [];
        const menuLoader = getMenuLoader(menus, pathname);
        let menu = void 0;
        loaders.forEach((moduleLoader, i) => {
          loadModule(moduleLoader, pendingLoads, (routeModule) => mods[i] = routeModule, cacheModules);
        });
        loadModule(menuLoader, pendingLoads, (menuModule) => menu = menuModule?.default, cacheModules);
        if (pendingLoads.length > 0)
          await Promise.all(pendingLoads);
        return [
          params,
          mods,
          menu,
          routeBundleNames
        ];
      }
    }
  return null;
};
const loadModule = (moduleLoader, pendingLoads, moduleSetter, cacheModules) => {
  if (typeof moduleLoader === "function") {
    const loadedModule = MODULE_CACHE.get(moduleLoader);
    if (loadedModule)
      moduleSetter(loadedModule);
    else {
      const l = moduleLoader();
      if (typeof l.then === "function")
        pendingLoads.push(l.then((loadedModule2) => {
          if (cacheModules !== false)
            MODULE_CACHE.set(moduleLoader, loadedModule2);
          moduleSetter(loadedModule2);
        }));
      else if (l)
        moduleSetter(l);
    }
  }
};
const getMenuLoader = (menus, pathname) => {
  if (menus) {
    pathname = pathname.endsWith("/") ? pathname : pathname + "/";
    const menu = menus.find((m) => m[0] === pathname || pathname.startsWith(m[0] + (pathname.endsWith("/") ? "" : "/")));
    if (menu)
      return menu[1];
  }
};
const getPathParams = (paramNames, match) => {
  const params = {};
  if (paramNames)
    for (let i = 0; i < paramNames.length; i++) {
      const param = match?.[i + 1] ?? "";
      params[paramNames[i]] = param.endsWith("/") ? param.slice(0, -1) : param;
    }
  return params;
};
const resolveHead = (endpoint, routeLocation, contentModules, locale) => {
  const head = createDocumentHead();
  const getData = (loaderOrAction) => {
    const id = loaderOrAction.__qrl.getHash();
    if (loaderOrAction.__brand === "server_loader") {
      if (!(id in endpoint.loaders))
        throw new Error("You can not get the returned data of a loader that has not been executed for this request.");
    }
    const data = endpoint.loaders[id];
    if (data instanceof Promise)
      throw new Error("Loaders returning a function can not be refered to in the head function.");
    return data;
  };
  const headProps = {
    head,
    withLocale: (fn) => qwik.withLocale(locale, fn),
    getData,
    ...routeLocation
  };
  for (let i = contentModules.length - 1; i >= 0; i--) {
    const contentModuleHead = contentModules[i] && contentModules[i].head;
    if (contentModuleHead) {
      if (typeof contentModuleHead === "function")
        resolveDocumentHead(head, qwik.withLocale(locale, () => contentModuleHead(headProps)));
      else if (typeof contentModuleHead === "object")
        resolveDocumentHead(head, contentModuleHead);
    }
  }
  return headProps.head;
};
const resolveDocumentHead = (resolvedHead, updatedHead) => {
  if (typeof updatedHead.title === "string")
    resolvedHead.title = updatedHead.title;
  mergeArray(resolvedHead.meta, updatedHead.meta);
  mergeArray(resolvedHead.links, updatedHead.links);
  mergeArray(resolvedHead.styles, updatedHead.styles);
  Object.assign(resolvedHead.frontmatter, updatedHead.frontmatter);
};
const mergeArray = (existingArr, newArr) => {
  if (Array.isArray(newArr))
    for (const newItem of newArr) {
      if (typeof newItem.key === "string") {
        const existingIndex = existingArr.findIndex((i) => i.key === newItem.key);
        if (existingIndex > -1) {
          existingArr[existingIndex] = newItem;
          continue;
        }
      }
      existingArr.push(newItem);
    }
};
const createDocumentHead = () => ({
  title: "",
  meta: [],
  links: [],
  styles: [],
  frontmatter: {}
});
const useContent = () => qwik.useContext(ContentContext);
const useDocumentHead = () => qwik.useContext(DocumentHeadContext);
const useLocation = () => qwik.useContext(RouteLocationContext);
const useNavigate = () => qwik.useContext(RouteNavigateContext);
const useAction = () => qwik.useContext(RouteActionContext);
const useQwikCityEnv = () => qwik.noSerialize(qwik.useEnvData("qwikcity"));
const toPath = (url) => url.pathname + url.search + url.hash;
const toUrl = (url, baseUrl) => new URL(url, baseUrl.href);
const isSameOrigin = (a, b) => a.origin === b.origin;
const isSamePath = (a, b) => a.pathname + a.search === b.pathname + b.search;
const isSamePathname = (a, b) => a.pathname === b.pathname;
const isSameOriginDifferentPathname = (a, b) => isSameOrigin(a, b) && !isSamePath(a, b);
const getClientDataPath = (pathname, pageSearch, action) => {
  let search = pageSearch ?? "";
  if (action)
    search += (search ? "&" : "?") + QACTION_KEY + "=" + encodeURIComponent(action.id);
  return pathname + (pathname.endsWith("/") ? "" : "/") + "q-data.json" + search;
};
const getClientNavPath = (props, baseUrl) => {
  const href = props.href;
  if (typeof href === "string" && href.trim() !== "" && typeof props.target !== "string")
    try {
      const linkUrl = toUrl(href, baseUrl);
      const currentUrl = toUrl("", baseUrl);
      if (isSameOrigin(linkUrl, currentUrl))
        return toPath(linkUrl);
    } catch (e) {
      console.error(e);
    }
  return null;
};
const getPrefetchDataset = (props, clientNavPath, currentLoc) => {
  if (props.prefetch === true && clientNavPath) {
    const prefetchUrl = toUrl(clientNavPath, currentLoc);
    if (!isSamePathname(prefetchUrl, toUrl("", currentLoc)))
      return "";
  }
  return null;
};
const clientNavigate = (win, newUrl, routeNavigate) => {
  const currentUrl = win.location;
  if (isSameOriginDifferentPathname(currentUrl, newUrl)) {
    handleScroll(win, currentUrl, newUrl);
    win.history.pushState("", "", toPath(newUrl));
  }
  if (!win[CLIENT_HISTORY_INITIALIZED]) {
    win[CLIENT_HISTORY_INITIALIZED] = 1;
    win.addEventListener("popstate", () => {
      const currentUrl2 = win.location;
      const previousUrl = toUrl(routeNavigate.value, currentUrl2);
      if (isSameOriginDifferentPathname(currentUrl2, previousUrl)) {
        handleScroll(win, previousUrl, currentUrl2);
        routeNavigate.value = toPath(currentUrl2);
      }
    });
    win.removeEventListener("popstate", win[POPSTATE_FALLBACK_INITIALIZED]);
  }
};
const handleScroll = async (win, previousUrl, newUrl) => {
  const doc = win.document;
  const newHash = newUrl.hash;
  if (isSamePath(previousUrl, newUrl)) {
    if (previousUrl.hash !== newHash) {
      await domWait();
      if (newHash)
        scrollToHashId(doc, newHash);
      else
        win.scrollTo(0, 0);
    }
  } else {
    if (newHash)
      for (let i = 0; i < 24; i++) {
        await domWait();
        if (scrollToHashId(doc, newHash))
          break;
      }
    else {
      await domWait();
      win.scrollTo(0, 0);
    }
  }
};
const domWait = () => new Promise((resolve) => setTimeout(resolve, 12));
const scrollToHashId = (doc, hash) => {
  const elmId = hash.slice(1);
  const elm = doc.getElementById(elmId);
  if (elm)
    elm.scrollIntoView();
  return elm;
};
const dispatchPrefetchEvent = (prefetchData) => {
  if (typeof document !== "undefined")
    document.dispatchEvent(new CustomEvent("qprefetch", {
      detail: prefetchData
    }));
};
const loadClientData = async (url, clearCache, action) => {
  const pagePathname = url.pathname;
  const pageSearch = url.search;
  const clientDataPath = getClientDataPath(pagePathname, pageSearch, action);
  let qData = void 0;
  if (!action)
    qData = CLIENT_DATA_CACHE.get(clientDataPath);
  dispatchPrefetchEvent({
    links: [
      pagePathname
    ]
  });
  if (!qData) {
    const options = getFetchOptions(action);
    if (action)
      action.data = void 0;
    qData = fetch(clientDataPath, options).then((rsp) => {
      const redirectedURL = new URL(rsp.url);
      if (redirectedURL.origin !== location.origin || !isQDataJson(redirectedURL.pathname)) {
        location.href = redirectedURL.href;
        return;
      }
      if ((rsp.headers.get("content-type") || "").includes("json"))
        return rsp.text().then((text) => {
          const clientData = qwik._deserializeData(text);
          if (!clientData) {
            location.href = url.href;
            return;
          }
          if (clearCache)
            CLIENT_DATA_CACHE.delete(clientDataPath);
          if (clientData.redirect)
            location.href = clientData.redirect;
          else if (action) {
            const actionData = clientData.loaders[action.id];
            action.resolve({
              status: rsp.status,
              result: actionData
            });
          }
          return clientData;
        });
      else {
        location.href = url.href;
        return void 0;
      }
    });
    if (!action)
      CLIENT_DATA_CACHE.set(clientDataPath, qData);
  }
  return qData.then((v) => {
    if (!v)
      CLIENT_DATA_CACHE.delete(clientDataPath);
    return v;
  });
};
const getFetchOptions = (action) => {
  const actionData = action?.data;
  if (!actionData)
    return void 0;
  if (actionData instanceof FormData)
    return {
      method: "POST",
      body: actionData
    };
  else
    return {
      method: "POST",
      body: JSON.stringify(actionData),
      headers: {
        "Content-Type": "application/json, charset=UTF-8"
      }
    };
};
const isQDataJson = (pathname) => {
  return pathname.endsWith(QDATA_JSON);
};
const QDATA_JSON = "/q-data.json";
const QwikCityProvider = /* @__PURE__ */ qwik.componentQrl(qwik.inlinedQrl(() => {
  const env = useQwikCityEnv();
  if (!env?.params)
    throw new Error(`Missing Qwik City Env Data`);
  const urlEnv = qwik.useServerData("url");
  if (!urlEnv)
    throw new Error(`Missing Qwik URL Env Data`);
  const url = new URL(urlEnv);
  const routeLocation = qwik.useStore({
    href: url.href,
    pathname: url.pathname,
    query: url.searchParams,
    params: env.params,
    isNavigating: false
  });
  const loaderState = qwik._weakSerialize(qwik.useStore(env.response.loaders));
  const navPath = qwik.useSignal(toPath(url));
  const documentHead = qwik.useStore(createDocumentHead);
  const content = qwik.useStore({
    headings: void 0,
    menu: void 0
  });
  const contentInternal = qwik.useSignal();
  const currentActionId = env.response.action;
  const currentAction = currentActionId ? env.response.loaders[currentActionId] : void 0;
  const actionState = qwik.useSignal(currentAction ? {
    id: currentActionId,
    data: env.response.formData,
    output: {
      result: currentAction,
      status: env.response.status
    }
  } : void 0);
  const goto = qwik.inlinedQrl(async (path) => {
    const [actionState2, navPath2, routeLocation2] = qwik.useLexicalScope();
    const value = navPath2.value;
    if (path) {
      if (value === path)
        return;
      navPath2.value = path;
    } else {
      navPath2.value = "";
      navPath2.value = value;
    }
    const prefetchURL = new URL(navPath2.value, routeLocation2.href);
    loadClientData(prefetchURL);
    loadRoute(_qwikCityPlan.routes, _qwikCityPlan.menus, _qwikCityPlan.cacheModules, prefetchURL.pathname);
    actionState2.value = void 0;
    routeLocation2.isNavigating = true;
  }, "QwikCityProvider_component_goto_fX0bDjeJa0E", [
    actionState,
    navPath,
    routeLocation
  ]);
  qwik.useContextProvider(ContentContext, content);
  qwik.useContextProvider(ContentInternalContext, contentInternal);
  qwik.useContextProvider(DocumentHeadContext, documentHead);
  qwik.useContextProvider(RouteLocationContext, routeLocation);
  qwik.useContextProvider(RouteNavigateContext, goto);
  qwik.useContextProvider(RouteStateContext, loaderState);
  qwik.useContextProvider(RouteActionContext, actionState);
  qwik.useTaskQrl(qwik.inlinedQrl(({ track }) => {
    const [actionState2, content2, contentInternal2, documentHead2, env2, loaderState2, navPath2, routeLocation2] = qwik.useLexicalScope();
    async function run() {
      const [path, action] = track(() => [
        navPath2.value,
        actionState2.value
      ]);
      const locale = qwik.getLocale("");
      let url2 = new URL(path, routeLocation2.href);
      let clientPageData;
      let loadedRoute = null;
      if (build.isServer) {
        loadedRoute = env2.loadedRoute;
        clientPageData = env2.response;
      } else {
        if (url2.pathname.endsWith("/")) {
          if (!_qwikCityPlan.trailingSlash)
            url2.pathname = url2.pathname.slice(0, -1);
        } else if (_qwikCityPlan.trailingSlash)
          url2.pathname += "/";
        let loadRoutePromise = loadRoute(_qwikCityPlan.routes, _qwikCityPlan.menus, _qwikCityPlan.cacheModules, url2.pathname);
        const pageData = clientPageData = await loadClientData(url2, true, action);
        if (!pageData) {
          navPath2.untrackedValue = toPath(url2);
          return;
        }
        const newHref = pageData.href;
        const newURL = new URL(newHref, url2.href);
        if (newURL.pathname !== url2.pathname) {
          url2 = newURL;
          loadRoutePromise = loadRoute(_qwikCityPlan.routes, _qwikCityPlan.menus, _qwikCityPlan.cacheModules, url2.pathname);
        }
        loadedRoute = await loadRoutePromise;
      }
      if (loadedRoute) {
        const [params, mods, menu] = loadedRoute;
        const contentModules = mods;
        const pageModule = contentModules[contentModules.length - 1];
        routeLocation2.href = url2.href;
        routeLocation2.pathname = url2.pathname;
        routeLocation2.params = {
          ...params
        };
        routeLocation2.query = url2.searchParams;
        navPath2.untrackedValue = toPath(url2);
        const resolvedHead = resolveHead(clientPageData, routeLocation2, contentModules, locale);
        content2.headings = pageModule.headings;
        content2.menu = menu;
        contentInternal2.value = qwik.noSerialize(contentModules);
        documentHead2.links = resolvedHead.links;
        documentHead2.meta = resolvedHead.meta;
        documentHead2.styles = resolvedHead.styles;
        documentHead2.title = resolvedHead.title;
        documentHead2.frontmatter = resolvedHead.frontmatter;
        if (build.isBrowser) {
          const loaders = clientPageData?.loaders;
          if (loaders)
            Object.assign(loaderState2, loaders);
          CLIENT_DATA_CACHE.clear();
          clientNavigate(window, url2, navPath2);
          routeLocation2.isNavigating = false;
        }
      }
    }
    const promise = run();
    if (build.isServer)
      return promise;
    else
      return;
  }, "QwikCityProvider_component_useTask_02wMImzEAbk", [
    actionState,
    content,
    contentInternal,
    documentHead,
    env,
    loaderState,
    navPath,
    routeLocation
  ]));
  return /* @__PURE__ */ jsxRuntime.jsx(qwik.Slot, {}, "qY_0");
}, "QwikCityProvider_component_TxCFOy819ag"));
const QwikCity = QwikCityProvider;
const Html = QwikCityProvider;
const QwikCityMockProvider = /* @__PURE__ */ qwik.componentQrl(qwik.inlinedQrl((props) => {
  const urlEnv = props.url ?? "http://localhost/";
  const url = new URL(urlEnv);
  const routeLocation = qwik.useStore({
    href: url.href,
    pathname: url.pathname,
    query: url.searchParams,
    params: props.params ?? {},
    isNavigating: false
  });
  const loaderState = qwik.useSignal({});
  const goto = qwik.inlinedQrl(async (path) => {
    throw new Error("Not implemented");
  }, "QwikCityMockProvider_component_goto_BUbtvTyvVRE");
  const documentHead = qwik.useStore(createDocumentHead);
  const content = qwik.useStore({
    headings: void 0,
    menu: void 0
  });
  const contentInternal = qwik.useSignal();
  qwik.useContextProvider(ContentContext, content);
  qwik.useContextProvider(ContentInternalContext, contentInternal);
  qwik.useContextProvider(DocumentHeadContext, documentHead);
  qwik.useContextProvider(RouteLocationContext, routeLocation);
  qwik.useContextProvider(RouteNavigateContext, goto);
  qwik.useContextProvider(RouteStateContext, loaderState);
  return /* @__PURE__ */ jsxRuntime.jsx(qwik.Slot, {}, "qY_1");
}, "QwikCityMockProvider_component_WmYC5H00wtI"));
const Link = /* @__PURE__ */ qwik.componentQrl(qwik.inlinedQrl((props) => {
  const nav = useNavigate();
  const loc = useLocation();
  const originalHref = props.href;
  const linkProps = {
    ...props
  };
  const clientNavPath = getClientNavPath(linkProps, loc);
  const prefetchDataset = getPrefetchDataset(props, clientNavPath, loc);
  linkProps["preventdefault:click"] = !!clientNavPath;
  linkProps.href = clientNavPath || originalHref;
  qwik.useOnDocument("qinit", qwik.inlinedQrl(() => {
    if (!window[POPSTATE_FALLBACK_INITIALIZED]) {
      window[POPSTATE_FALLBACK_INITIALIZED] = () => {
        if (!window[CLIENT_HISTORY_INITIALIZED])
          location.reload();
      };
      setTimeout(() => {
        addEventListener("popstate", window[POPSTATE_FALLBACK_INITIALIZED]);
      }, 0);
    }
  }, "Link_component_useOnDocument_u0YVoxt2aTY"));
  return /* @__PURE__ */ jsxRuntime.jsx("a", {
    ...linkProps,
    onClick$: qwik.inlinedQrl(() => {
      const [clientNavPath2, linkProps2, nav2] = qwik.useLexicalScope();
      if (clientNavPath2)
        nav2(linkProps2.href);
    }, "Link_component_a_onClick_kzjavhDI3L0", [
      clientNavPath,
      linkProps,
      nav
    ]),
    "data-prefetch": prefetchDataset,
    onMouseOver$: qwik.inlinedQrl((_, elm) => prefetchLinkResources(elm), "Link_component_a_onMouseOver_yiXwCC0m3jY"),
    onFocus$: qwik.inlinedQrl((_, elm) => prefetchLinkResources(elm), "Link_component_a_onFocus_PrXIxv2vNXY"),
    onQVisible$: qwik.inlinedQrl((_, elm) => prefetchLinkResources(elm, true), "Link_component_a_onQVisible_EpaZ5qQ4Lg4"),
    children: /* @__PURE__ */ jsxRuntime.jsx(qwik.Slot, {}, "AD_0")
  }, "AD_1");
}, "Link_component_8gdLBszqbaM"));
const prefetchLinkResources = (elm, isOnVisible) => {
  if (elm && elm.href && elm.hasAttribute("data-prefetch")) {
    if (!windowInnerWidth)
      windowInnerWidth = innerWidth;
    if (!isOnVisible || isOnVisible && windowInnerWidth < 520)
      loadClientData(new URL(elm.href));
  }
};
let windowInnerWidth = 0;
const ServiceWorkerRegister = () => qwik.jsx("script", {
  dangerouslySetInnerHTML: swRegister
});
const actionQrl = (actionQrl2, options) => {
  const id = actionQrl2.getHash();
  function action() {
    const loc = useLocation();
    const currentAction = useAction();
    const initialState = {
      actionPath: `?${QACTION_KEY}=${id}`,
      isRunning: false,
      status: void 0,
      value: void 0,
      formData: void 0
    };
    const state = qwik.useStore(() => {
      const value = currentAction.value;
      if (value && value?.id === id) {
        const data = value.data;
        if (data instanceof FormData)
          initialState.formData = data;
        if (value.output) {
          const { status, result } = value.output;
          initialState.status = status;
          initialState.value = result;
        }
      }
      return initialState;
    });
    initialState.run = qwik.inlinedQrl((input = {}) => {
      const [currentAction2, id2, loc2, state2] = qwik.useLexicalScope();
      if (build.isServer)
        throw new Error(`Actions can not be invoked within the server during SSR.
Action.run() can only be called on the browser, for example when a user clicks a button, or submits a form.`);
      let data;
      let form;
      if (input instanceof SubmitEvent) {
        form = input.target;
        data = new FormData(form);
      } else
        data = input;
      return new Promise((resolve) => {
        if (data instanceof FormData)
          state2.formData = data;
        state2.isRunning = true;
        loc2.isNavigating = true;
        currentAction2.value = {
          data,
          id: id2,
          resolve: qwik.noSerialize(resolve)
        };
      }).then(({ result, status }) => {
        state2.isRunning = false;
        state2.status = status;
        state2.value = result;
        if (form) {
          if (form.getAttribute("data-spa-reset") === "true")
            form.reset();
          const detail = {
            status,
            value: result
          };
          form.dispatchEvent(new CustomEvent("submitcompleted", {
            bubbles: false,
            cancelable: false,
            composed: false,
            detail
          }));
        }
        return {
          status,
          value: result
        };
      });
    }, "actionQrl_action_8eAhmK7N0n0", [
      currentAction,
      id,
      loc,
      state
    ]);
    return state;
  }
  action.__brand = "server_action";
  action.__schema = options;
  action.__qrl = actionQrl2;
  action.use = action;
  if (build.isServer) {
    if (typeof globalThis._qwikActionsMap === "undefined")
      globalThis._qwikActionsMap = /* @__PURE__ */ new Map();
    globalThis._qwikActionsMap.set(actionQrl2.getHash(), action);
  }
  return action;
};
const action$ = qwik.implicit$FirstArg(actionQrl);
const loaderQrl = (loaderQrl2) => {
  const hash = loaderQrl2.getHash();
  function loader() {
    return qwik.useContext(RouteStateContext, (state) => {
      if (!(hash in state))
        throw new Error(`Loader was used in a path where the 'loader$' was not declared.
    This is likely because the used loader was not exported in a layout.tsx or index.tsx file of the existing route.
    For more information check: https://qwik.builder.io/qwikcity/loader`);
      return qwik._wrapSignal(state, hash);
    });
  }
  loader.__brand = "server_loader";
  loader.__qrl = loaderQrl2;
  loader.use = loader;
  return loader;
};
const loader$ = qwik.implicit$FirstArg(loaderQrl);
const zodQrl = async (qrl) => {
  if (build.isServer) {
    let obj = await qrl.resolve();
    if (typeof obj === "function")
      obj = obj(zod.z);
    return zod.z.object(obj);
  }
  return void 0;
};
const zod$ = qwik.implicit$FirstArg(zodQrl);
const Form = ({ action, spaReset, reloadDocument, onSubmit$, ...rest }) => {
  return qwik.jsx("form", {
    ...rest,
    action: action.actionPath,
    "preventdefault:submit": !reloadDocument,
    onSubmit$: [
      !reloadDocument ? action.run : void 0,
      onSubmit$
    ],
    method: "post",
    ["data-spa-reset"]: spaReset ? "true" : void 0
  });
};
Object.defineProperty(exports, "z", {
  enumerable: true,
  get: () => zod.z
});
exports.Content = Content;
exports.Form = Form;
exports.Html = Html;
exports.Link = Link;
exports.QwikCity = QwikCity;
exports.QwikCityMockProvider = QwikCityMockProvider;
exports.QwikCityProvider = QwikCityProvider;
exports.RouterOutlet = RouterOutlet;
exports.ServiceWorkerRegister = ServiceWorkerRegister;
exports.action$ = action$;
exports.actionQrl = actionQrl;
exports.loader$ = loader$;
exports.loaderQrl = loaderQrl;
exports.useContent = useContent;
exports.useDocumentHead = useDocumentHead;
exports.useLocation = useLocation;
exports.useNavigate = useNavigate;
exports.zod$ = zod$;
exports.zodQrl = zodQrl;
