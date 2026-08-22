import { AsyncLocalStorage } from "node:async_hooks";
import { H as H3Event, t as toResponse, g as getRequestHost, a as getRequestIP } from "../_libs/h3-v2.mjs";
import { s as resolveManifestAssetLink, j as rootRouteId, v as defineHandlerCallback, w as getNormalizedURL, x as getOrigin, y as attachRouterServerSsrUtils, z as createSerializationAdapter, A as createRawStreamRPCPlugin, i as invariant, g as isNotFound, l as isRedirect, C as isResolvedRedirect, D as mergeHeaders, E as executeRewriteInput, F as defaultSerovalPlugins, G as makeSerovalPlugin, H as parseRedirect } from "../_libs/tanstack__router-core.mjs";
import { a as au, I as Iu, o as ou } from "../_libs/seroval.mjs";
import { c as createMemoryHistory } from "../_libs/tanstack__history.mjs";
import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { r as renderRouterToStream, R as RouterProvider } from "../_libs/tanstack__react-router.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:stream";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "stream";
import "crypto";
import "../_libs/isbot.mjs";
function StartServer(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(RouterProvider, { router: props.router });
}
var defaultStreamHandler = defineHandlerCallback(({ request, router, responseHeaders }) => renderRouterToStream({
  request,
  router,
  responseHeaders,
  children: /* @__PURE__ */ jsxRuntimeExports.jsx(StartServer, { router })
}));
var GLOBAL_EVENT_STORAGE_KEY = /* @__PURE__ */ Symbol.for("tanstack-start:event-storage");
var globalObj$1 = globalThis;
if (!globalObj$1[GLOBAL_EVENT_STORAGE_KEY]) globalObj$1[GLOBAL_EVENT_STORAGE_KEY] = new AsyncLocalStorage();
var eventStorage = globalObj$1[GLOBAL_EVENT_STORAGE_KEY];
function isPromiseLike(value) {
  return typeof value.then === "function";
}
function getSetCookieValues(headers) {
  const headersWithSetCookie = headers;
  if (typeof headersWithSetCookie.getSetCookie === "function") return headersWithSetCookie.getSetCookie();
  const value = headers.get("set-cookie");
  return value ? [value] : [];
}
function mergeEventResponseHeaders(response, event) {
  if (response.ok) return;
  const eventSetCookies = getSetCookieValues(event.res.headers);
  if (eventSetCookies.length === 0) return;
  const responseSetCookies = getSetCookieValues(response.headers);
  response.headers.delete("set-cookie");
  for (const cookie of responseSetCookies) response.headers.append("set-cookie", cookie);
  for (const cookie of eventSetCookies) response.headers.append("set-cookie", cookie);
}
function attachResponseHeaders(value, event) {
  if (isPromiseLike(value)) return value.then((resolved) => {
    if (resolved instanceof Response) mergeEventResponseHeaders(resolved, event);
    return resolved;
  });
  if (value instanceof Response) mergeEventResponseHeaders(value, event);
  return value;
}
function requestHandler(handler) {
  return (request, requestOpts) => {
    let h3Event;
    try {
      h3Event = new H3Event(request);
    } catch (error) {
      if (error instanceof URIError) return new Response(null, {
        status: 400,
        statusText: "Bad Request"
      });
      throw error;
    }
    return toResponse(attachResponseHeaders(eventStorage.run({ h3Event }, () => handler(request, requestOpts)), h3Event), h3Event);
  };
}
function getH3Event() {
  const event = eventStorage.getStore();
  if (!event) throw new Error(`No StartEvent found in AsyncLocalStorage. Make sure you are using the function within the server runtime.`);
  return event.h3Event;
}
function getRequest() {
  return getH3Event().req;
}
function getRequestHeaders() {
  return getH3Event().req.headers;
}
function getRequestHeader(name) {
  return getRequestHeaders().get(name) || void 0;
}
function getRequestIP$1(opts) {
  return getRequestIP(getH3Event(), opts);
}
function getRequestHost$1(opts) {
  return getRequestHost(getH3Event(), opts);
}
function getResponse() {
  return getH3Event().res;
}
var HEADERS = { TSS_SHELL: "X-TSS_SHELL" };
async function getStartManifest(matchedRoutes) {
  const { tsrStartManifest } = await import("../_tanstack-start-manifest_v-DZbWhq8S.mjs");
  const startManifest = tsrStartManifest();
  const rootRoute = startManifest.routes[rootRouteId] = startManifest.routes[rootRouteId] || {};
  rootRoute.assets = rootRoute.assets || [];
  let injectedHeadScripts;
  return {
    manifest: {
      inlineCss: startManifest.inlineCss,
      routes: Object.fromEntries(Object.entries(startManifest.routes).flatMap(([k, v]) => {
        const result = {};
        let hasData = false;
        if (v.preloads && v.preloads.length > 0) {
          result["preloads"] = v.preloads;
          hasData = true;
        }
        if (v.assets && v.assets.length > 0) {
          result["assets"] = v.assets;
          hasData = true;
        }
        if (!hasData) return [];
        return [[k, result]];
      }))
    },
    clientEntry: startManifest.clientEntry,
    injectedHeadScripts
  };
}
const manifest = {
  "0d2e6486bb79d16006411b50330fa12aa33a0f2c05073e892dae795341f2d24a": {
    functionName: "getCareersByTenantSlug_createServerFn_handler",
    importer: () => import("./careers.functions-BkpwqkQk.mjs")
  },
  "dc53f2f3eecc862902d2ef16ba7bb8998c9600c067da1ee890ae0825b8543e58": {
    functionName: "getJobBySlug_createServerFn_handler",
    importer: () => import("./careers.functions-BkpwqkQk.mjs")
  },
  "ca629a86389fff83ec9be09f23e23516a4e9b6c1a7267d8bd44548bdecd9200f": {
    functionName: "getCareersSettings_createServerFn_handler",
    importer: () => import("./careers.functions-BkpwqkQk.mjs")
  },
  "e749404053deaff22d38d90a24e7676b66711eac6d84e7001fde765012587b9c": {
    functionName: "updateCareersSettings_createServerFn_handler",
    importer: () => import("./careers.functions-BkpwqkQk.mjs")
  },
  "63d91e4b39380a95e603911e12138847e2f093467e085a0da7b00321a2568afc": {
    functionName: "updateJobPublication_createServerFn_handler",
    importer: () => import("./careers.functions-BkpwqkQk.mjs")
  },
  "2958288976e42aa638dc71f0a39064337637c77d0e83bddf9f078c7003c0ff3a": {
    functionName: "listOffboarding_createServerFn_handler",
    importer: () => import("./offboarding.functions-gHvTXXG_.mjs")
  },
  "ea31b6d6547080465b8d4a5fe80d1265e1795f3d91b8492b144a2ea913da862a": {
    functionName: "createOffboarding_createServerFn_handler",
    importer: () => import("./offboarding.functions-gHvTXXG_.mjs")
  },
  "a66847756ee769ed40f256447ce180f86e8081880fadec25fd215df17d53c81e": {
    functionName: "getOffboarding_createServerFn_handler",
    importer: () => import("./offboarding.functions-gHvTXXG_.mjs")
  },
  "7ed3818e1b3fa2e8dd999e0df0b68a0d1d4e3dbb5669f488d4f8107dc6cc9ef7": {
    functionName: "updateOffboarding_createServerFn_handler",
    importer: () => import("./offboarding.functions-gHvTXXG_.mjs")
  },
  "6ef710c8dc517340ce30d61836fe1d52f10fd7967df54f4e0fb6d7cf4820f654": {
    functionName: "toggleChecklistItem_createServerFn_handler",
    importer: () => import("./offboarding.functions-gHvTXXG_.mjs")
  },
  "92f61154d5767c93cfe0db5c4a817b51f9484ed0e5d2619e807ae580bc477a71": {
    functionName: "addChecklistItem_createServerFn_handler",
    importer: () => import("./offboarding.functions-gHvTXXG_.mjs")
  },
  "4e034a4952a1d3e1c2e6c195e1c3a44f9c094cc73480e6feb565ef080349689d": {
    functionName: "myOffboarding_createServerFn_handler",
    importer: () => import("./offboarding.functions-gHvTXXG_.mjs")
  },
  "d956351cece4e70ffc475713225e9b859605db557213c7ee812b9848a4117d84": {
    functionName: "listOffboardingTemplates_createServerFn_handler",
    importer: () => import("./offboarding.functions-gHvTXXG_.mjs")
  },
  "e6655661829253a0206e59f3e9d6010d2fe7cd4cfcbe64b83a902343c63bda3f": {
    functionName: "upsertOffboardingTemplate_createServerFn_handler",
    importer: () => import("./offboarding.functions-gHvTXXG_.mjs")
  },
  "0ffbce3e4771e398d29c03574f822a9f3f8f06e7e6998b7a9865a943f7015c4b": {
    functionName: "deleteOffboardingTemplate_createServerFn_handler",
    importer: () => import("./offboarding.functions-gHvTXXG_.mjs")
  },
  "71ba11a19c38d1be47a2c78c0f4ac4bb3f4f9cd4db408acb71bdddd2010303ab": {
    functionName: "upsertOffboardingTemplateItem_createServerFn_handler",
    importer: () => import("./offboarding.functions-gHvTXXG_.mjs")
  },
  "3fb78cb6d4d2bb14098129f1d958be77e0b0c1d5dabccb2bcde6b536d8ed7f7a": {
    functionName: "deleteOffboardingTemplateItem_createServerFn_handler",
    importer: () => import("./offboarding.functions-gHvTXXG_.mjs")
  },
  "fefed6b92333be889e22e8b290fa9f8136a4be4fbe87b46ba1f00c3f352c0f5d": {
    functionName: "listAssets_createServerFn_handler",
    importer: () => import("./assets.functions-DcsOBppF.mjs")
  },
  "c83c0a7349ea0eec53b2b2c3bc3ea7508eec1fbef34d916fded49a5d2cfbea2d": {
    functionName: "createAsset_createServerFn_handler",
    importer: () => import("./assets.functions-DcsOBppF.mjs")
  },
  "604481d33c6821c5b7ed44bda1d8a6f8c485ac6b05707be0bdfb55db30115601": {
    functionName: "assignAsset_createServerFn_handler",
    importer: () => import("./assets.functions-DcsOBppF.mjs")
  },
  "deb372557a58ed4278941e570e5f4d2ef8181005f099f897f6519788ab47b865": {
    functionName: "approveAssignment_createServerFn_handler",
    importer: () => import("./assets.functions-DcsOBppF.mjs")
  },
  "79cca338ffd2d45722244ffac637b587a786752886be265170492fc6b72c478c": {
    functionName: "reportReturn_createServerFn_handler",
    importer: () => import("./assets.functions-DcsOBppF.mjs")
  },
  "ba7170bf365ec02491b8248f9edc17b4608295a7498e12944aa8080ad6ae1121": {
    functionName: "confirmReturn_createServerFn_handler",
    importer: () => import("./assets.functions-DcsOBppF.mjs")
  },
  "b62569105d13ede8e99895342a9a309996693f0f91cd6a8b3d1758875132cfc4": {
    functionName: "returnAsset_createServerFn_handler",
    importer: () => import("./assets.functions-DcsOBppF.mjs")
  },
  "9921da9ec24ca1cf3d06b94af7110a1e3a39d802abde3aea0af0c84657f8d99c": {
    functionName: "acknowledgeAsset_createServerFn_handler",
    importer: () => import("./assets.functions-DcsOBppF.mjs")
  },
  "8ad03a6750f03a6ac8fe43417ab08cd47f4c36681a1fc0bee4b60de212ded1a3": {
    functionName: "listAssignments_createServerFn_handler",
    importer: () => import("./assets.functions-DcsOBppF.mjs")
  },
  "fc21ae80fbf058748623fb201f6f574077ec152bdc8883b9007bf9df959f4641": {
    functionName: "myAssignments_createServerFn_handler",
    importer: () => import("./assets.functions-DcsOBppF.mjs")
  },
  "6db7c529484f3cd5527717590dfb3f4e56ce179ee648e729755f2206ffe14cd8": {
    functionName: "getMfaPolicy_createServerFn_handler",
    importer: () => import("./mfa-policy.functions-By0Ac_-a.mjs")
  },
  "00d094b0a3325038d256ab2caa727be6a0abb42d425693a754f949df1b7e890e": {
    functionName: "updateMfaPolicy_createServerFn_handler",
    importer: () => import("./mfa-policy.functions-By0Ac_-a.mjs")
  },
  "be0039ba06064dee76b74eb28049bc3495089845cc02db64ee956c240ff36699": {
    functionName: "getMyMfaStatus_createServerFn_handler",
    importer: () => import("./mfa-policy.functions-By0Ac_-a.mjs")
  },
  "f078a7b520eb504621e52866a950164fd13d355039caaa2df619b00598d852b7": {
    functionName: "getOrgAnalytics_createServerFn_handler",
    importer: () => import("./analytics.functions-Cdgabdlq.mjs")
  },
  "d7e10a83ce977fbadc14fe63b74e4b07b0b56694b2686c8e820e5b6daf782045": {
    functionName: "getOrgReports_createServerFn_handler",
    importer: () => import("./reports.functions-C7olXxTt.mjs")
  },
  "214a77e62f12e4e764f58fbba19b652fa5b3066d4ff5de816fa577df84a65b5c": {
    functionName: "clockIn_createServerFn_handler",
    importer: () => import("./attendance.functions-dX23SHyL.mjs")
  },
  "ab60a0940ed93c286890a4c4e055753b6088799ab6e7f9af78567bd07091fa7d": {
    functionName: "clockOut_createServerFn_handler",
    importer: () => import("./attendance.functions-dX23SHyL.mjs")
  },
  "fa087c682e4f5d034e776a3d554cdcafd77cad98d9f600402ad0c876eb4b57af": {
    functionName: "upsertAttendanceEntry_createServerFn_handler",
    importer: () => import("./attendance.functions-dX23SHyL.mjs")
  },
  "357947bb533d1c692665e58b6a7d498a31d843958095241b000630b16afec5c3": {
    functionName: "submitTimesheet_createServerFn_handler",
    importer: () => import("./attendance.functions-dX23SHyL.mjs")
  },
  "997f66817090c248bcdcf087eea62e3408dc29a51e5b29bfc263ec9e3ec8ba16": {
    functionName: "approveTimesheet_createServerFn_handler",
    importer: () => import("./attendance.functions-dX23SHyL.mjs")
  },
  "a192dc79fa5b24d95e3addf72707b62be53254f6f26b0c07c4784fd7213029bb": {
    functionName: "rejectTimesheet_createServerFn_handler",
    importer: () => import("./attendance.functions-dX23SHyL.mjs")
  },
  "c017b24a4940a916334ff23b3f3461893d7b3f151e06bac76f968dd27c3f187b": {
    functionName: "listNotifications_createServerFn_handler",
    importer: () => import("./notifications.functions-By_MnX2u.mjs")
  },
  "385e76cdf807dd53711b6f969d894db85cf9b0ca7a6373bb34c6352adedccb64": {
    functionName: "markNotificationRead_createServerFn_handler",
    importer: () => import("./notifications.functions-By_MnX2u.mjs")
  },
  "607ba84c3614f5cd3696ec0b7e8d7ae11a3e99c338d06525020aa747044a3e00": {
    functionName: "markNotificationUnread_createServerFn_handler",
    importer: () => import("./notifications.functions-By_MnX2u.mjs")
  },
  "51dc49f9f5fa2d4880620c24ceb97b55255cc14c1d3e473e99af061851cf699d": {
    functionName: "submitLeaveRequest_createServerFn_handler",
    importer: () => import("./leave.functions-PWxPeu_d.mjs")
  },
  "b52994b4c73f413d7cfb4e1546af79359c94a09044a87eb847e2ebb546df7a10": {
    functionName: "cancelLeaveRequest_createServerFn_handler",
    importer: () => import("./leave.functions-PWxPeu_d.mjs")
  },
  "4b098ff8304ccf4f65a4522ea2009394eac5aed196f330a2be6a8de2e821ed95": {
    functionName: "approveLeaveRequest_createServerFn_handler",
    importer: () => import("./leave.functions-PWxPeu_d.mjs")
  },
  "99fe582eafb1895c99f5deecf27c7774bc76bcddc7cf45c04504ec0a4ff2ca33": {
    functionName: "rejectLeaveRequest_createServerFn_handler",
    importer: () => import("./leave.functions-PWxPeu_d.mjs")
  },
  "56009bcd82cc592ed4df4e8902eba9f6d4ad9503fe938232f7d55e1a0474c362": {
    functionName: "seedStripePrices_createServerFn_handler",
    importer: () => import("./billing-admin.functions-DzXm2lY0.mjs")
  },
  "b27b018f44dc7f7ef1ebe15fe8418bcc6fb40c1bdd9fa2e01a8c500843aa86a8": {
    functionName: "listBillingAlerts_createServerFn_handler",
    importer: () => import("./billing-admin.functions-DzXm2lY0.mjs")
  },
  "543f2aba4ff3039c548b52dc68cdef230c52a25c755f98f9e20e13f3de0caaba": {
    functionName: "resolveBillingAlert_createServerFn_handler",
    importer: () => import("./billing-admin.functions-DzXm2lY0.mjs")
  },
  "5a42409c302e66a9653658bce909de48ebeb1efb38974f842890346bd0a632ac": {
    functionName: "retryBillingAlert_createServerFn_handler",
    importer: () => import("./billing-admin.functions-DzXm2lY0.mjs")
  },
  "d381560dbf7cf124233e9cc95534e52ff527d33405202ed17430f9dbddb87f3f": {
    functionName: "listTenantsBillingOverview_createServerFn_handler",
    importer: () => import("./billing-admin.functions-DzXm2lY0.mjs")
  },
  "36002535fb1e225721b4860489096fcd2b4b75866a0c63d6ec6b6c2f7281d1aa": {
    functionName: "runReconciliationForMonth_createServerFn_handler",
    importer: () => import("./billing-admin.functions-DzXm2lY0.mjs")
  },
  "c7e9e012819dc4c51d2c906a4d6bf65f09d06e45ee9e2631cfa0866036effb41": {
    functionName: "exportBillingForMonth_createServerFn_handler",
    importer: () => import("./billing-admin.functions-DzXm2lY0.mjs")
  },
  "eb1089c484d1e0548424139905e67d90196e1bbdeab974097626d0325615b35f": {
    functionName: "scheduleTenantPlanChange_createServerFn_handler",
    importer: () => import("./billing-admin.functions-DzXm2lY0.mjs")
  },
  "ecb59828d050cca8bf9b27aae93d9898232d3f32b87ae550918de3f636afa156": {
    functionName: "listReconciliationForMonth_createServerFn_handler",
    importer: () => import("./billing-admin.functions-DzXm2lY0.mjs")
  },
  "d1a592560e2ee4cf5b12da250f45e18702f535a1a53094abeb042c7fdc0adbd3": {
    functionName: "listBillingOpsAudit_createServerFn_handler",
    importer: () => import("./billing-admin.functions-DzXm2lY0.mjs")
  },
  "dbfc5bf6a9532386ec281d2d8d4bd469a47d19c7c6a74d17cab2fbe776c1ba25": {
    functionName: "listDiscrepancies_createServerFn_handler",
    importer: () => import("./billing-admin.functions-DzXm2lY0.mjs")
  },
  "11361e080bf6fd48995609975a61bcc526e5e4ffb72cdeda4601f69a92a5d6a2": {
    functionName: "exportDiscrepanciesCsv_createServerFn_handler",
    importer: () => import("./billing-admin.functions-DzXm2lY0.mjs")
  },
  "f160c4e6ab95124c1db9e08fcfbc462ba4caccc3316e0c92e16dc12f137ad9cb": {
    functionName: "listTenantsLite_createServerFn_handler",
    importer: () => import("./billing-admin.functions-DzXm2lY0.mjs")
  },
  "7032244eb569294ab033b465f4ab4f16fd8da60134934eec5b55237b6c0380b5": {
    functionName: "previewInvoiceImpact_createServerFn_handler",
    importer: () => import("./billing-admin.functions-DzXm2lY0.mjs")
  },
  "b5c30167e8b61a0d90d6d775704bd6ed3add13c4a80caaa25fc595bcedc5d3d2": {
    functionName: "listAlertSuppressions_createServerFn_handler",
    importer: () => import("./billing-admin.functions-DzXm2lY0.mjs")
  },
  "58bcfc7760ceebef3131838ec850d2eab5d22a0ad806266a8723840c70a02520": {
    functionName: "upsertAlertSuppression_createServerFn_handler",
    importer: () => import("./billing-admin.functions-DzXm2lY0.mjs")
  },
  "06a97018592a4c12e0ffef13021722e2739cad095d776f1c4c6acacf7459fff7": {
    functionName: "deleteAlertSuppression_createServerFn_handler",
    importer: () => import("./billing-admin.functions-DzXm2lY0.mjs")
  },
  "cacd25b2d7bed51bcd78f3fcbebf99fc670ba4e01f3a7e0fe0d4bbfca0346334": {
    functionName: "listRetryPolicies_createServerFn_handler",
    importer: () => import("./billing-admin.functions-DzXm2lY0.mjs")
  },
  "b408a65fc1086339c9c3087cdfc72155a04cc434d080e671f8e380d489a4916f": {
    functionName: "upsertRetryPolicy_createServerFn_handler",
    importer: () => import("./billing-admin.functions-DzXm2lY0.mjs")
  },
  "97396264961f0b973e0b41b2d86f9785ab0350e3dcf88b1a7103fbc598b9a609": {
    functionName: "exportBillingOpsAuditCsv_createServerFn_handler",
    importer: () => import("./billing-admin.functions-DzXm2lY0.mjs")
  },
  "7820bc776ea6553100598f413c7dfa090e68c3bcbd3827ff8f9182cb9411454c": {
    functionName: "listBillingOpsAuditFiltered_createServerFn_handler",
    importer: () => import("./billing-admin.functions-DzXm2lY0.mjs")
  },
  "7ed9904cc68911432d82eecd7363a8fdb3dcefa6b0bcba4a65119e90b6c6c73c": {
    functionName: "runMonthlyLeaveAccrual_createServerFn_handler",
    importer: () => import("./leave-accruals.functions-zTTYQP5x.mjs")
  },
  "b6a045e5655649ee3d5a2483ed47eb6f1d6471dcb9093d1f68913ce06263465a": {
    functionName: "runYearEndCarryOver_createServerFn_handler",
    importer: () => import("./leave-accruals.functions-zTTYQP5x.mjs")
  },
  "4b2e174424fdef09003bb03cd2e7c0b7c26d2eaa9fb73b5410ac47ee497df150": {
    functionName: "adjustLeaveBalance_createServerFn_handler",
    importer: () => import("./leave-accruals.functions-zTTYQP5x.mjs")
  },
  "c4f1764d024bcad6fb3c5751ea205c700100e9ff4c49966898058c6e6f88cb63": {
    functionName: "projectLeaveBalances_createServerFn_handler",
    importer: () => import("./leave-accruals.functions-zTTYQP5x.mjs")
  },
  "6fa7f9598c2bbf059aa8d16a0f3372034460c651b828ac38c3600e80903a77d6": {
    functionName: "syncAuHolidays_createServerFn_handler",
    importer: () => import("./au-holidays-sync.functions-ksqyHgEi.mjs")
  },
  "b5113ef54c545cb4b6e49ae37426399ae528fbbf78349891e5311899041457bd": {
    functionName: "listAuHolidaySyncLog_createServerFn_handler",
    importer: () => import("./au-holidays-sync.functions-ksqyHgEi.mjs")
  },
  "c896de4d3ec6f4ba7fbf1c2a883e3bf6cfbe2130e7f64badeb7fc37758d8d2de": {
    functionName: "logEventAccess_createServerFn_handler",
    importer: () => import("./audit.functions-CjOaPbBn.mjs")
  },
  "5b327706dd5af5d8c7a5b3eacb57e0714cc8d3f6ba606263b71386e399f8a42e": {
    functionName: "listEventAccessLog_createServerFn_handler",
    importer: () => import("./audit.functions-CjOaPbBn.mjs")
  },
  "b1f9091f8a7e72854687c4465f582f6abb7488bd7bed5ea75264338a3778b70a": {
    functionName: "accessLogSummary_createServerFn_handler",
    importer: () => import("./audit.functions-CjOaPbBn.mjs")
  },
  "0f0776b6c6902e3e3f577fb0e065fa475664ae5b3f3f3544bff9ce44ee1a0eb4": {
    functionName: "exploreAudit_createServerFn_handler",
    importer: () => import("./audit-explorer.functions-LeIyFwdy.mjs")
  },
  "97e2f5e2a53559a58d3a56c2b34751a44a0a35a82ccfda4534516299d3de984f": {
    functionName: "exportAuditCsv_createServerFn_handler",
    importer: () => import("./audit-explorer.functions-LeIyFwdy.mjs")
  },
  "760d30b15466142371eb617a0a3e9308ce3f0e9f4dcafeeec112ee9da368b34c": {
    functionName: "exportOnboardingTrackerAuditCsv_createServerFn_handler",
    importer: () => import("./audit-explorer.functions-LeIyFwdy.mjs")
  },
  "0faecac0cabbcc0106f44db547ad455fb9f25c13889f86b682811daaa7d1cb3c": {
    functionName: "listRetentionPolicies_createServerFn_handler",
    importer: () => import("./audit-retention.functions-yI4XGvzh.mjs")
  },
  "a2a3945f6d6ee03312526405cdd3440ed8d4ff0846418420a6dc4375dde14730": {
    functionName: "upsertRetentionPolicy_createServerFn_handler",
    importer: () => import("./audit-retention.functions-yI4XGvzh.mjs")
  },
  "abbcea8fac19abf2457725a529dfb32089108315cbb6a95a626d079b7f7ba71f": {
    functionName: "runRetentionNow_createServerFn_handler",
    importer: () => import("./audit-retention.functions-yI4XGvzh.mjs")
  },
  "653e717188d05af64cb1fd584e953d7220c3432cd506524e8ab90cbf8363dc81": {
    functionName: "enqueueAuditExportJob_createServerFn_handler",
    importer: () => import("./csv-export-jobs.functions-Dmckq7kY.mjs")
  },
  "2db07948e34e2cae816a4c7775da3ec1b2e02923428acf8f5ff2b9dbd3e83fc5": {
    functionName: "retryExportJob_createServerFn_handler",
    importer: () => import("./csv-export-jobs.functions-Dmckq7kY.mjs")
  },
  "c3cc822a7c06cee70e315cf00b753bb9ebcabf6b9b72fbca4832aa9dd49708d8": {
    functionName: "getExportJobHistory_createServerFn_handler",
    importer: () => import("./csv-export-jobs.functions-Dmckq7kY.mjs")
  },
  "ac544c2ecd68d6831263be40ecb5814457f94a8cb41e8ba03900f0b45acee3a0": {
    functionName: "getExportJob_createServerFn_handler",
    importer: () => import("./csv-export-jobs.functions-Dmckq7kY.mjs")
  },
  "8761b24ee7fcc37bac8dd99522755e36012b032ad134fab44201e008fc5885a9": {
    functionName: "downloadExportJob_createServerFn_handler",
    importer: () => import("./csv-export-jobs.functions-Dmckq7kY.mjs")
  },
  "bde92074fb4da91ccaf860955c4341387d806f297e9593794f6f969fce396c44": {
    functionName: "listMyRecentExportJobs_createServerFn_handler",
    importer: () => import("./csv-export-jobs.functions-Dmckq7kY.mjs")
  },
  "0a2f37f3f622d44a57726ae0c9c3c095b7dac27b65220c0b62799f00a0b65f27": {
    functionName: "getCsvExportRetention_createServerFn_handler",
    importer: () => import("./csv-export-jobs.functions-Dmckq7kY.mjs")
  },
  "9e2e79e4eba6f1dd8aff2464fe45d058bb9ebd1c2b03162cb5be75d6d8abe476": {
    functionName: "updateCsvExportRetention_createServerFn_handler",
    importer: () => import("./csv-export-jobs.functions-Dmckq7kY.mjs")
  },
  "72825e9b46a5c885c77a75525373e1faedc10ed8ec47887547b564bdec7fde41": {
    functionName: "listOnboardingTrackerRows_createServerFn_handler",
    importer: () => import("./onboarding-tracker.functions-BP8WgTyz.mjs")
  },
  "af257575dd4616160fc9c895f390ab6f221faae2bd8523de8121f0e8040d8f8c": {
    functionName: "attestControlRoomTask_createServerFn_handler",
    importer: () => import("./onboarding-tracker.functions-BP8WgTyz.mjs")
  },
  "756f51b013ce24ca31145c63d7fafa7fa86faac2691c3426362700c0358a970d": {
    functionName: "toggleTaskAttestationRequired_createServerFn_handler",
    importer: () => import("./onboarding-tracker.functions-BP8WgTyz.mjs")
  },
  "ea2ed1576d6d3267dd471a669a2877f0c575f98d01e1ec3370e3103fdf265f9b": {
    functionName: "acknowledgeCountryMerge_createServerFn_handler",
    importer: () => import("./onboarding-tracker.functions-BP8WgTyz.mjs")
  },
  "d18667f1417277d9887c43a7b2268655099565f94896b1f8c64a6745451c90fb": {
    functionName: "deleteTenant_createServerFn_handler",
    importer: () => import("./danger-zone.functions-CG4el711.mjs")
  },
  "1d1739e9578e4582299f91887aa3c92621e467cd7a904fef971b73e6f3e681f6": {
    functionName: "bulkDeleteEmployees_createServerFn_handler",
    importer: () => import("./danger-zone.functions-CG4el711.mjs")
  },
  "401fca7e742e5ad31f8fb3b3a98e8c33d726c8471a4b4c143a94f115d9851128": {
    functionName: "purgePayrollHistory_createServerFn_handler",
    importer: () => import("./danger-zone.functions-CG4el711.mjs")
  },
  "5a71826e133d711c1939267bc2bb4601cc9ec431ed649f1935304c5f835732d1": {
    functionName: "transferOwnership_createServerFn_handler",
    importer: () => import("./danger-zone.functions-CG4el711.mjs")
  },
  "27301031363e284184ead21ac910c33ebfbe9159435c975f26319c6a65fade88": {
    functionName: "deleteMyAccount_createServerFn_handler",
    importer: () => import("./account.functions-T_9K2-34.mjs")
  },
  "2b5dfb231c0dc54b0ab84412468065d222f8d3344fc10e785336ea2782d1bf27": {
    functionName: "getNotificationPreferences_createServerFn_handler",
    importer: () => import("./notification-preferences.functions-B3hL1VJs.mjs")
  },
  "84e1b1e044857d5f61116fec8e7ddb247da6b777f1f970a1289518301a3a45ba": {
    functionName: "updateNotificationPreferences_createServerFn_handler",
    importer: () => import("./notification-preferences.functions-B3hL1VJs.mjs")
  },
  "fdf53032c638e6fe525c2cd96c854a8485edc65a2bb729421a7e142feae6e5f2": {
    functionName: "upsertChecklist_createServerFn_handler",
    importer: () => import("./onboarding.functions-CADK4yJN.mjs")
  },
  "894f5aab2ebc8cf74eac8b7c322d435b8288268b2074db4ffe232d4d7780f335": {
    functionName: "listChecklistPacks_createServerFn_handler",
    importer: () => import("./onboarding.functions-CADK4yJN.mjs")
  },
  "b3a57f2f97a98187a78628d161dd48a5ec8b855082504ebdc9d7fcb1d85fd7e8": {
    functionName: "reorderChecklistPacks_createServerFn_handler",
    importer: () => import("./onboarding.functions-CADK4yJN.mjs")
  },
  "68beafaf06ed9a79eb3321da003354c0c9cb3887d082f3d57a6133a988ac656b": {
    functionName: "cloneChecklistPack_createServerFn_handler",
    importer: () => import("./onboarding.functions-CADK4yJN.mjs")
  },
  "9ebe00b9c5969f68c37f00a82accb9bd5968ade791ecc6c75b8f13a0bac36256": {
    functionName: "deleteChecklistPack_createServerFn_handler",
    importer: () => import("./onboarding.functions-CADK4yJN.mjs")
  },
  "0051aa2eb720efbb56396eed715debdb3345f3caddbbcd4209834c14d7d922d1": {
    functionName: "upsertDefaultAssignmentRule_createServerFn_handler",
    importer: () => import("./onboarding.functions-CADK4yJN.mjs")
  },
  "6ecb35027c349ab7121b45b725e22704ef526aa3cfa263f6f0e1a0e8c7ac1503": {
    functionName: "deleteDefaultAssignmentRule_createServerFn_handler",
    importer: () => import("./onboarding.functions-CADK4yJN.mjs")
  },
  "42aef7d28880e099d10f61d9168e115b47b594da7ae6043d8df650642b91d6c4": {
    functionName: "toggleChecklistItem_createServerFn_handler",
    importer: () => import("./onboarding.functions-CADK4yJN.mjs")
  },
  "c1d0684fdcb6dff96b25d6a6dbce1616f4bf56b23b188ef1e1371d36501bae8c": {
    functionName: "recordEmployeeDocument_createServerFn_handler",
    importer: () => import("./onboarding.functions-CADK4yJN.mjs")
  },
  "65e3c7ab18fd36a5ca63b2a117a5fc81d25362706b3dd4c83f30d0e45e2ac0cc": {
    functionName: "getDocumentDownloadUrl_createServerFn_handler",
    importer: () => import("./onboarding.functions-CADK4yJN.mjs")
  },
  "2255fd918d512f265eebaef47e0d9f1718dec7539bc36fb4769991cf8b2ac50c": {
    functionName: "deleteEmployeeDocument_createServerFn_handler",
    importer: () => import("./onboarding.functions-CADK4yJN.mjs")
  },
  "ac034b3b6be24b432fa868c4ded271d6d22e602c8b6de5a11b17d942f3080e90": {
    functionName: "assignChecklist_createServerFn_handler",
    importer: () => import("./onboarding.functions-CADK4yJN.mjs")
  },
  "15088323b596cf506cc2d16b744107e84dd75b762c060a80390ff6106a386655": {
    functionName: "applyDefaultAssignmentsForEmployee_createServerFn_handler",
    importer: () => import("./onboarding.functions-CADK4yJN.mjs")
  },
  "08422225a8bb407c6dffa36d39534102be78a00020dff41651d439ddc6af1025": {
    functionName: "updateAssignment_createServerFn_handler",
    importer: () => import("./onboarding.functions-CADK4yJN.mjs")
  },
  "00b97c0cf68f6a4a55208420634e8c84e782651beb7d885973bb54b50fde717c": {
    functionName: "signOffAssignment_createServerFn_handler",
    importer: () => import("./onboarding.functions-CADK4yJN.mjs")
  },
  "d4b2b0f2091847739ef7bb57192d3ba3b38469fd3e243a77ee06e34b5510eff9": {
    functionName: "removeAssignment_createServerFn_handler",
    importer: () => import("./onboarding.functions-CADK4yJN.mjs")
  },
  "ff01829140524c7f2d1e8a014726aff5e3dc5bcea80bed4e3de2c2639589d23e": {
    functionName: "reviewChecklistItem_createServerFn_handler",
    importer: () => import("./onboarding.functions-CADK4yJN.mjs")
  },
  "81d4d12082841f8e2533592ffbb61d1bbb95e3ceef5a4222b3700abf74555930": {
    functionName: "getMyOnboardingCompletion_createServerFn_handler",
    importer: () => import("./onboarding.functions-CADK4yJN.mjs")
  },
  "572e11fcab03a07d652c1e7da6f334e0d2d2e8b9734e808c71fee21767020f3e": {
    functionName: "getRecentEmailLog_createServerFn_handler",
    importer: () => import("./diagnostics.functions-DkBU-7p8.mjs")
  },
  "60c5af065f2e24e05251b8b13c57837f280fae8daf2d36b7aa7b8c24ec18e1af": {
    functionName: "getDashboardSnapshot_createServerFn_handler",
    importer: () => import("./dashboard.functions-CmKT3Hks.mjs")
  },
  "d6f0c07183a83b2b3ddcfe1ff63683404163a04d558f4ab1103417468861b11e": {
    functionName: "listHolidayOverrideAudit_createServerFn_handler",
    importer: () => import("./holiday-override-audit.functions-2TQ8iNMO.mjs")
  },
  "c0fd210c433caf14a752547f1fb4ae2176ab9f043dc2285a5f6f59a856f4efe4": {
    functionName: "submitMyTimesheet_createServerFn_handler",
    importer: () => import("./timesheet-workflow.functions-D0LG_jPw.mjs")
  },
  "34384cbaf14a51d4cee13db4d484801476ba2bf38ddbdf2b8da7a5c9e3f3b5a7": {
    functionName: "listMyTimesheets_createServerFn_handler",
    importer: () => import("./timesheet-workflow.functions-D0LG_jPw.mjs")
  },
  "88b97621fabcdf3c9c46d80908d710dc8e0ce4afc294a8e77734fd40571615a1": {
    functionName: "listPendingTimesheets_createServerFn_handler",
    importer: () => import("./timesheet-workflow.functions-D0LG_jPw.mjs")
  },
  "69f6ae2536a2e4826c69427822bb9e033c36cfeb436770cd7f415598bf4fef01": {
    functionName: "approveTimesheet_createServerFn_handler",
    importer: () => import("./timesheet-workflow.functions-D0LG_jPw.mjs")
  },
  "057fccf1556f97bfef2151cb27957d15638fa490daffcc4ccd27a1d7cd11c961": {
    functionName: "rejectTimesheet_createServerFn_handler",
    importer: () => import("./timesheet-workflow.functions-D0LG_jPw.mjs")
  },
  "37ff8749f71134bd639040e742b4f79fbfd9c98758bc4f436945ae243c651ab2": {
    functionName: "getAuStpAudit_createServerFn_handler",
    importer: () => import("./au-stp-audit.functions-BU4UCGOc.mjs")
  },
  "1588f6379566ed5fe0712c28cb8a7cddc11a6c7353a22b745c0edf1f1d3cd13a": {
    functionName: "listCases_createServerFn_handler",
    importer: () => import("./discipline.functions-Bw8UfJzc.mjs")
  },
  "e92e3ff542436bd5a061f4f4873d70c7317486ddf595e4dea5e241b5c7fad5c4": {
    functionName: "upsertCase_createServerFn_handler",
    importer: () => import("./discipline.functions-Bw8UfJzc.mjs")
  },
  "2085180efdf4b63b2cbef0a425c5b0c12d34f15acbd4afd46315ac36ab18d26e": {
    functionName: "deleteCase_createServerFn_handler",
    importer: () => import("./discipline.functions-Bw8UfJzc.mjs")
  },
  "ae727b651f3ebb7883ee1bda085d09af9c6bf362fef5982c5c5cdfab91752fe8": {
    functionName: "assignCase_createServerFn_handler",
    importer: () => import("./discipline.functions-Bw8UfJzc.mjs")
  },
  "3a73a63b8d7e00023b41a53569f5fedb498f4ed5a5a4a7a932e2a06d099414f2": {
    functionName: "transitionCaseStatus_createServerFn_handler",
    importer: () => import("./discipline.functions-Bw8UfJzc.mjs")
  },
  "7d41a8a207444a57a9cdd9405fe9022468edde413499c8c17cacb653878c0b2a": {
    functionName: "listActions_createServerFn_handler",
    importer: () => import("./discipline.functions-Bw8UfJzc.mjs")
  },
  "204761bffb91fef0a2583828d5e098518b3ecfd200a5cd402f02207232746fc6": {
    functionName: "addAction_createServerFn_handler",
    importer: () => import("./discipline.functions-Bw8UfJzc.mjs")
  },
  "a0df176bc0b2ffcd80083a4307aa3aaf1b172b11c3ff547553db43d4c0183499": {
    functionName: "deleteAction_createServerFn_handler",
    importer: () => import("./discipline.functions-Bw8UfJzc.mjs")
  },
  "38f15c59de22297c225c51c19ce6f80f81999ac95fe0b0761af9d828a3788bf4": {
    functionName: "listApprovals_createServerFn_handler",
    importer: () => import("./discipline.functions-Bw8UfJzc.mjs")
  },
  "598c872155879b7ce24f12c04b13c84d5726c1a7c37b4a32f7e7204917bc215f": {
    functionName: "requestApproval_createServerFn_handler",
    importer: () => import("./discipline.functions-Bw8UfJzc.mjs")
  },
  "b599389b700411d5326a882095d49132be54a1a71575b1dcc0198b1fe56d66cb": {
    functionName: "decideApproval_createServerFn_handler",
    importer: () => import("./discipline.functions-Bw8UfJzc.mjs")
  },
  "450c2850d094d4deeb12475a25fa4d62ce8ce454eff78dd7b2f3d4c40f67098c": {
    functionName: "recordCaseAttachment_createServerFn_handler",
    importer: () => import("./discipline.functions-Bw8UfJzc.mjs")
  },
  "3626d58098700108e1af2e20841b5c131acf906f4795180c4a2ae74b3bf163f9": {
    functionName: "listCaseAttachments_createServerFn_handler",
    importer: () => import("./discipline.functions-Bw8UfJzc.mjs")
  },
  "bc712b193130f003731961ea9744f78e2c38f9eb06d9d8058aade9a3a369e653": {
    functionName: "deleteCaseAttachment_createServerFn_handler",
    importer: () => import("./discipline.functions-Bw8UfJzc.mjs")
  },
  "8475f2eb35958e96d327092198cf7e3face4314ce3647d04ec4f59eaa13efefb": {
    functionName: "getAttachmentDownloadUrl_createServerFn_handler",
    importer: () => import("./discipline.functions-Bw8UfJzc.mjs")
  },
  "3a438b4a0d2d96312e1412c80cd1a42846047e9ae6afe8fe934ae87621f257a8": {
    functionName: "listGrievances_createServerFn_handler",
    importer: () => import("./discipline.functions-Bw8UfJzc.mjs")
  },
  "744cb23bdc1c0d5915d9b3c715b338e6bdb151e44020b749709875c8ef08032c": {
    functionName: "fileGrievance_createServerFn_handler",
    importer: () => import("./discipline.functions-Bw8UfJzc.mjs")
  },
  "dc94ab1ddd11d3d0b8dd832a4e5327a85d026039c7aa2ac95c3b5e8199ca90e6": {
    functionName: "updateGrievance_createServerFn_handler",
    importer: () => import("./discipline.functions-Bw8UfJzc.mjs")
  },
  "fcec3e78436396cc4a06fae10c266dce20d3882812c5f688238fbb402849288a": {
    functionName: "withdrawGrievance_createServerFn_handler",
    importer: () => import("./discipline.functions-Bw8UfJzc.mjs")
  },
  "757f0ee24b32e336dd618a12769e63e6b042a752af2ac7688c83bdb7465ea5c2": {
    functionName: "listGrievanceComments_createServerFn_handler",
    importer: () => import("./discipline.functions-Bw8UfJzc.mjs")
  },
  "f8e3bded2e85be19044a01c21ccaaa46c9af56cb2329cc7be4c47cf49cc67772": {
    functionName: "addGrievanceComment_createServerFn_handler",
    importer: () => import("./discipline.functions-Bw8UfJzc.mjs")
  },
  "5f63873bc3979e64b4a61a6beed91fb184d9a5afb659c9a00f3d0c9d8a93c3d5": {
    functionName: "recordGrievanceAttachment_createServerFn_handler",
    importer: () => import("./discipline.functions-Bw8UfJzc.mjs")
  },
  "01b8467da135182d02b4c1e430e784aafeba1fee2ec28a2aa300c85146bfa5f3": {
    functionName: "listGrievanceAttachments_createServerFn_handler",
    importer: () => import("./discipline.functions-Bw8UfJzc.mjs")
  },
  "b0a27f2d10824671bbac900bf31e8d2589d40e45e4469cd29a8aa86a0b6f32c5": {
    functionName: "deleteGrievanceAttachment_createServerFn_handler",
    importer: () => import("./discipline.functions-Bw8UfJzc.mjs")
  },
  "cb5d34f0a4888e01931179354c19068d89b2637fc45396fb4bf55f91e4e57e91": {
    functionName: "listHrUsers_createServerFn_handler",
    importer: () => import("./discipline.functions-Bw8UfJzc.mjs")
  },
  "5dbf46616266e7bfe81c82694a91090a42de6200b3efc1b9d156faf41ac3a479": {
    functionName: "getMyProfile_createServerFn_handler",
    importer: () => import("./profile.functions-zV1bUgi7.mjs")
  },
  "af00eb763dce352dc2f42ef901ef426a138feb40fdc7f79166552837a77fae5f": {
    functionName: "updateMyProfile_createServerFn_handler",
    importer: () => import("./profile.functions-zV1bUgi7.mjs")
  },
  "302f6e704602a0bc960bc3646298576a03e45bb96d2db403c236e75dda851298": {
    functionName: "listBiometricDevices_createServerFn_handler",
    importer: () => import("./biometric.functions-x-3n5Lv6.mjs")
  },
  "e5b6f2526e7e83bc93fcd40da7735f0f0e4abc96dc6686bf9e80a4c585bacdbd": {
    functionName: "upsertBiometricDevice_createServerFn_handler",
    importer: () => import("./biometric.functions-x-3n5Lv6.mjs")
  },
  "72ac49f34ae0f396d86dcf00339e07d894bf0f94adf40f0a40e4769700c41094": {
    functionName: "rotateDeviceSecret_createServerFn_handler",
    importer: () => import("./biometric.functions-x-3n5Lv6.mjs")
  },
  "5ee7a1a6fdd6b4770e1f0bb12069f066a47f7c7d5e41c670c1d92634b06dabca": {
    functionName: "listMappings_createServerFn_handler",
    importer: () => import("./biometric.functions-x-3n5Lv6.mjs")
  },
  "98c6928dbdaf6f141a711aabb4b5f72168c66ff693d5f2d8b91caad47bb3d3a4": {
    functionName: "upsertMapping_createServerFn_handler",
    importer: () => import("./biometric.functions-x-3n5Lv6.mjs")
  },
  "0c745e035e7c721c3e6e86e9dc94e8957f8abcaa2e88cde995c3ab455ca9a342": {
    functionName: "listPunches_createServerFn_handler",
    importer: () => import("./biometric.functions-x-3n5Lv6.mjs")
  },
  "8b08788657203cdc725d6efdc5bdb38374ed607e4289cb59249b44eaf9504caa": {
    functionName: "importPunchesManually_createServerFn_handler",
    importer: () => import("./biometric.functions-x-3n5Lv6.mjs")
  },
  "38a059c7c56f258ecf0fd577322fab7ea1dab989c245970924220bbdf9b9cf35": {
    functionName: "listAllTenants_createServerFn_handler",
    importer: () => import("./super-admin.functions-C1BcRTzP.mjs")
  },
  "755946e7bb339b2600bfd3aef35c331bfd91856ad9d5990989de03990fde30bb": {
    functionName: "upsertTenantGovernance_createServerFn_handler",
    importer: () => import("./super-admin.functions-C1BcRTzP.mjs")
  },
  "7ccf3bd7107ee265ddf1c8ec032e58be400ca0026d0036d09b92fb4b57a4f9b1": {
    functionName: "getMyWhiteLabel_createServerFn_handler",
    importer: () => import("./super-admin.functions-C1BcRTzP.mjs")
  },
  "e0636e952288b6d5b75b2dd10da807b0a09a7dead31f3f47bc78c6ff8fc62fe6": {
    functionName: "upsertMyWhiteLabel_createServerFn_handler",
    importer: () => import("./super-admin.functions-C1BcRTzP.mjs")
  },
  "9781fb47a04c324365096d3f513c71bbaff9523ec99923a005dc4708ba01df4d": {
    functionName: "listFxRates_createServerFn_handler",
    importer: () => import("./super-admin.functions-C1BcRTzP.mjs")
  },
  "3cd89f9467e2a897ead219d6e39a927b95a828619daba021e10faa299424853f": {
    functionName: "upsertFxRate_createServerFn_handler",
    importer: () => import("./super-admin.functions-C1BcRTzP.mjs")
  },
  "efb0cd057ad4bb9847b226e4a310e6193b6bc58eacbe542794b93e785df79cdf": {
    functionName: "getToilSettings_createServerFn_handler",
    importer: () => import("./toil.functions-2Yb6l5oZ.mjs")
  },
  "9778b76ca2160bcf041d0b6a1c661dfe0b791f335171ee829534d0d539e7dd90": {
    functionName: "updateToilSettings_createServerFn_handler",
    importer: () => import("./toil.functions-2Yb6l5oZ.mjs")
  },
  "93e4f54591ff5c472854f827e078523f1b496f638a6b68c6cfd802e0a70daa4f": {
    functionName: "getMyToilBalance_createServerFn_handler",
    importer: () => import("./toil.functions-2Yb6l5oZ.mjs")
  },
  "5cf00bd0a0060e5a88be9d1768e50e136c7d013aa0406d52caa3207497669fbc": {
    functionName: "submitToilRequest_createServerFn_handler",
    importer: () => import("./toil.functions-2Yb6l5oZ.mjs")
  },
  "eaaef50a43920100fbc59206c5651924cb9724abecb07098fee6ca23cc8ce687": {
    functionName: "cancelToilRequest_createServerFn_handler",
    importer: () => import("./toil.functions-2Yb6l5oZ.mjs")
  },
  "d288e3fc866f1811066947ba7cd44902b75d47d8eba535b948ff6a4d6a762d62": {
    functionName: "listPendingToilApprovals_createServerFn_handler",
    importer: () => import("./toil.functions-2Yb6l5oZ.mjs")
  },
  "b7543b5778c4ebd6516882bb98777a9729d3b755df6e4eed4c5ebfbe9a6767f5": {
    functionName: "decideToilRequest_createServerFn_handler",
    importer: () => import("./toil.functions-2Yb6l5oZ.mjs")
  },
  "bdb7bf50713b3cfbda9eb659028788a7926bd6d30934fc65b494f33400697517": {
    functionName: "addToilAccrual_createServerFn_handler",
    importer: () => import("./toil.functions-2Yb6l5oZ.mjs")
  },
  "4cb97f9251606316942a48a418cae55d6972633e8458d8eaf5bebb76b30a61e6": {
    functionName: "getToilReport_createServerFn_handler",
    importer: () => import("./toil.functions-2Yb6l5oZ.mjs")
  },
  "8f8398e96f70354858f29e9774e76da8f68d81529cf60e32bd0d6b7c36138a8a": {
    functionName: "listTemplates_createServerFn_handler",
    importer: () => import("./documents.functions-4tumpcHv.mjs")
  },
  "279ed1469b4ca2b9991da32381113186ad1ba836a45d71f49aaab50e2c58a06c": {
    functionName: "getTemplate_createServerFn_handler",
    importer: () => import("./documents.functions-4tumpcHv.mjs")
  },
  "988de5c255de0140459b3fbe3ff3f4e18109c1492bf453b5bbd6f772f3bbedea": {
    functionName: "upsertTemplate_createServerFn_handler",
    importer: () => import("./documents.functions-4tumpcHv.mjs")
  },
  "73769c5ccda941434468190642584a61396f75a48db78803dc3470365be06524": {
    functionName: "publishTemplate_createServerFn_handler",
    importer: () => import("./documents.functions-4tumpcHv.mjs")
  },
  "d2ed42b050fd0eb33060b934e42e6790d348255b6a6b49a46efa2d7ba4508b80": {
    functionName: "archiveTemplate_createServerFn_handler",
    importer: () => import("./documents.functions-4tumpcHv.mjs")
  },
  "645c993d6bd494f5b894b9bd244045d0e7ca4ae69ffe281b3ecadfb04ce0b402": {
    functionName: "cloneTemplate_createServerFn_handler",
    importer: () => import("./documents.functions-4tumpcHv.mjs")
  },
  "493d371f437e58ea84560e458b360a66aaf25f8515d2775d99a7713439a2ed15": {
    functionName: "sendEnvelopes_createServerFn_handler",
    importer: () => import("./documents.functions-4tumpcHv.mjs")
  },
  "6a61749174e00b5f6f1dba9d3b62065a3301ba07fa28dedf556620a1492cce1d": {
    functionName: "listEnvelopes_createServerFn_handler",
    importer: () => import("./documents.functions-4tumpcHv.mjs")
  },
  "2c8b2f576335cfeb8a70e9b9026e9016b4e5929bb9485aef89c16c430ad4960e": {
    functionName: "getEnvelope_createServerFn_handler",
    importer: () => import("./documents.functions-4tumpcHv.mjs")
  },
  "41ff17276628972f6589ba5fa4c55d62fc4ae8f6103b1e1ca2f8f08891fc6696": {
    functionName: "cancelEnvelope_createServerFn_handler",
    importer: () => import("./documents.functions-4tumpcHv.mjs")
  },
  "ad9ef467e0293322ecb0b0f6c06ce0a3138a5b69f939addad28fdfb193ad189c": {
    functionName: "myPendingEnvelopes_createServerFn_handler",
    importer: () => import("./documents.functions-4tumpcHv.mjs")
  },
  "f8f238ab345677ff42a3f1cc0916f88d9281b9c1d206cde9493aef020a6beeb0": {
    functionName: "getSigningEnvelope_createServerFn_handler",
    importer: () => import("./documents.functions-4tumpcHv.mjs")
  },
  "f9c994d04030c47f67f804b8043b8f05b95c6f868cf389d501d063d429b67330": {
    functionName: "submitSignature_createServerFn_handler",
    importer: () => import("./documents.functions-4tumpcHv.mjs")
  },
  "7c2fa475a105a23489b9543e8d511ee4918ef170db9694884479a9919d461708": {
    functionName: "declineEnvelope_createServerFn_handler",
    importer: () => import("./documents.functions-4tumpcHv.mjs")
  },
  "3a737fdfa82a3e2e650faefb09107b9a405d719dbac97834d49d9d0880dad171": {
    functionName: "sendEnvelopeReminder_createServerFn_handler",
    importer: () => import("./documents.functions-4tumpcHv.mjs")
  },
  "23d6c4acec297d0614c7ce517d851ff7850138f3887ead0b16d6568c6450e58b": {
    functionName: "getCertificate_createServerFn_handler",
    importer: () => import("./documents.functions-4tumpcHv.mjs")
  },
  "bbbd0a43cc6d2edca875cf88cfa631aab6dff19aa626ad51aaa99f7062ddc562": {
    functionName: "renderTemplatePreview_createServerFn_handler",
    importer: () => import("./documents.functions-4tumpcHv.mjs")
  },
  "0784cfa9c0df1fbc161b9d8bb8bca3a23f5b08bc3b41ddfc6c3c49848d499fcc": {
    functionName: "listExpiringDocuments_createServerFn_handler",
    importer: () => import("./documents.functions-4tumpcHv.mjs")
  },
  "a25b2d07aa2e174d9ab26eedba0431b7b8a693a0a4fd72d0fbd6237647d961a9": {
    functionName: "verifyEmployeeDocument_createServerFn_handler",
    importer: () => import("./documents.functions-4tumpcHv.mjs")
  },
  "a5ef2f439fe399e7725f2852aca65618ae9363c979702d3f955c33b7e6fcec2c": {
    functionName: "listStarterTemplates_createServerFn_handler",
    importer: () => import("./documents.functions-4tumpcHv.mjs")
  },
  "94181a72b451f8dd8515d1821ae35359a010d9b4499864315d6144a75300d711": {
    functionName: "getStarterTemplate_createServerFn_handler",
    importer: () => import("./documents.functions-4tumpcHv.mjs")
  },
  "bb20c5d63b4cedc513d09ee27fb135a72baf892deac26b364f76661a51acee46": {
    functionName: "instantiateStarterTemplate_createServerFn_handler",
    importer: () => import("./documents.functions-4tumpcHv.mjs")
  },
  "822f4aa8da65749a2d19d0e7a7af1e75dff4b996eb0c1199b6163306c7055346": {
    functionName: "listClients_createServerFn_handler",
    importer: () => import("./practice.functions-L5T957Yw.mjs")
  },
  "7c9a494933082b870351313e7179d9a44f02f3d9bd53a45ba222db9563e69926": {
    functionName: "upsertClient_createServerFn_handler",
    importer: () => import("./practice.functions-L5T957Yw.mjs")
  },
  "0a7ff2ac066f445f4e21e3dc6176ac4d06420eaa9ae363abc40e5a8262286c34": {
    functionName: "listProjects_createServerFn_handler",
    importer: () => import("./practice.functions-L5T957Yw.mjs")
  },
  "72b0fccf6f2dd0e559c99a1d0ef7220790ef399fe11663cfc7b6e8ba2cdabc97": {
    functionName: "upsertProject_createServerFn_handler",
    importer: () => import("./practice.functions-L5T957Yw.mjs")
  },
  "21a7040ae70d1835dd1979e661fd20f7d46d0451001cf4a05e02573412644369": {
    functionName: "listJobs_createServerFn_handler",
    importer: () => import("./practice.functions-L5T957Yw.mjs")
  },
  "eea7c7bfc0382a635d079f2fee91f083e60ceba3a0e93b479bc95b9c32d61bf3": {
    functionName: "upsertJob_createServerFn_handler",
    importer: () => import("./practice.functions-L5T957Yw.mjs")
  },
  "b25c806ae12822410b4cc0a295a47679e8367a43e2f7b07d01bf916faf9b0c37": {
    functionName: "listMyTimeEntries_createServerFn_handler",
    importer: () => import("./practice.functions-L5T957Yw.mjs")
  },
  "b57c5cf5e8154ff04d80f837ef22d22dabd9661743987c3970a0103aa7079446": {
    functionName: "upsertMyTimeEntry_createServerFn_handler",
    importer: () => import("./practice.functions-L5T957Yw.mjs")
  },
  "d8d41365d34236cc48697102c4ae69be53bd3c016a135ea6156cd8f43e4a4293": {
    functionName: "deleteMyTimeEntry_createServerFn_handler",
    importer: () => import("./practice.functions-L5T957Yw.mjs")
  },
  "5c46d6231af1b16cd9a5d2cd5ec3100c125c0f32d5c2f300720153fb07503e7d": {
    functionName: "listInvoices_createServerFn_handler",
    importer: () => import("./practice.functions-L5T957Yw.mjs")
  },
  "efe6ea08a2364c51e6f3dbd4c7c66ff0bb56ece308697b1ef9ab66d7618e7504": {
    functionName: "upsertInvoice_createServerFn_handler",
    importer: () => import("./practice.functions-L5T957Yw.mjs")
  },
  "5ace03deafe9fb94ced3ac8bf485a411f455311764fdbe8f097267cc7c9cd273": {
    functionName: "getInvoice_createServerFn_handler",
    importer: () => import("./practice.functions-L5T957Yw.mjs")
  },
  "4a8350adb476ce3da86a6791bbd6a4e802b8c802a539273801ac6630472aac1a": {
    functionName: "markInvoicePaid_createServerFn_handler",
    importer: () => import("./practice.functions-L5T957Yw.mjs")
  },
  "361b18249109298692958d5705e73c32f7c0000e1cbcf949f43a7fdd14a482a4": {
    functionName: "listCycles_createServerFn_handler",
    importer: () => import("./kpi-cycles.functions-CcXVnr2k.mjs")
  },
  "4e5b4c57436dc33cd06914494e442cbddab33d398e915acc1aaea5b79b4990be": {
    functionName: "listOpenCyclesForMe_createServerFn_handler",
    importer: () => import("./kpi-cycles.functions-CcXVnr2k.mjs")
  },
  "ee9e994f44ae3fcd2eea64a5b5209808bbbd804e6adf90e2401c50636da507ef": {
    functionName: "upsertCycle_createServerFn_handler",
    importer: () => import("./kpi-cycles.functions-CcXVnr2k.mjs")
  },
  "972bc4ca31856bab91740ca5ece74800427f7a6f00697fac06a1f28ad53463fa": {
    functionName: "setCycleStatus_createServerFn_handler",
    importer: () => import("./kpi-cycles.functions-CcXVnr2k.mjs")
  },
  "9e8b7f78a3747aa36dc86125d673c90f069c99cedc54e0b641818bb209e9da1c": {
    functionName: "deleteCycle_createServerFn_handler",
    importer: () => import("./kpi-cycles.functions-CcXVnr2k.mjs")
  },
  "34f508a4852fc8ebb38c6537eba77f6092b1bc1a01d549cf5b9b66d40cd70b95": {
    functionName: "getCycleSubmissionStatus_createServerFn_handler",
    importer: () => import("./kpi-cycles.functions-CcXVnr2k.mjs")
  },
  "5bf2fff50878a89e2f005c6950c9c43845d6f2aa79f137d97c2de9737cdcd144": {
    functionName: "getKpiWeightSettings_createServerFn_handler",
    importer: () => import("./kpi-cycles.functions-CcXVnr2k.mjs")
  },
  "2731f50b96dae24899bc75c832271f5ce776768d06dd35c873a5c585bb2824de": {
    functionName: "updateKpiWeightSettings_createServerFn_handler",
    importer: () => import("./kpi-cycles.functions-CcXVnr2k.mjs")
  },
  "ab612d28a0939aea6573fe025a8d037a1567f58ba732845fd363e12eaef0ac9b": {
    functionName: "listRecruitmentJobs_createServerFn_handler",
    importer: () => import("./recruitment.functions-BLQMdxgM.mjs")
  },
  "84f4baed7babb8083bd777c31ad28ae0ed84ae4ac12d33b51834da09fa25193a": {
    functionName: "upsertRecruitmentJob_createServerFn_handler",
    importer: () => import("./recruitment.functions-BLQMdxgM.mjs")
  },
  "e1fd3afd430a3723ba43e557df9fce741508965ce16019c7f0be2fc949929031": {
    functionName: "getRecruitmentJob_createServerFn_handler",
    importer: () => import("./recruitment.functions-BLQMdxgM.mjs")
  },
  "8221ef19dfc9eb4e38fd3541f0af0de9c2f8fc21c5b247e656ec7895d4432599": {
    functionName: "moveCandidate_createServerFn_handler",
    importer: () => import("./recruitment.functions-BLQMdxgM.mjs")
  },
  "cae1ef93884eaa7c7fe8c80981346dfa1f25adca59b3aab25eb574e494055325": {
    functionName: "getCandidate_createServerFn_handler",
    importer: () => import("./recruitment.functions-BLQMdxgM.mjs")
  },
  "dd86218314eba30393572665a141c445e1b9a77f81aa9076ca6470934d752aee": {
    functionName: "scheduleInterview_createServerFn_handler",
    importer: () => import("./recruitment.functions-BLQMdxgM.mjs")
  },
  "738ef682d21527af956233c5a9bff52a5f0110ad5e2a6e863790d798d0170f2d": {
    functionName: "submitScorecard_createServerFn_handler",
    importer: () => import("./recruitment.functions-BLQMdxgM.mjs")
  },
  "e7f94d82bba143fc66ab87696442edfec378050fda9418387802034d6e913719": {
    functionName: "addCandidateNote_createServerFn_handler",
    importer: () => import("./recruitment.functions-BLQMdxgM.mjs")
  },
  "45962f5bc935a649b706b9a2c8d118c79accf6533a39ab45f7c274cf8f63a6e8": {
    functionName: "createOffer_createServerFn_handler",
    importer: () => import("./recruitment.functions-BLQMdxgM.mjs")
  },
  "83153de83d0fd15b8697875634355ad591891675dea405914042bdac8ee05492": {
    functionName: "upsertStage_createServerFn_handler",
    importer: () => import("./recruitment.functions-BLQMdxgM.mjs")
  },
  "cf6da4080ee10ec8ebc212fa4642df7a3d6885baf5647601b1e36f25a82dfa50": {
    functionName: "deleteStage_createServerFn_handler",
    importer: () => import("./recruitment.functions-BLQMdxgM.mjs")
  },
  "5bcf5f8a16911c894f6f16fff451e31e32164845dff8ecc26e2e5ea2731158a0": {
    functionName: "reorderStages_createServerFn_handler",
    importer: () => import("./recruitment.functions-BLQMdxgM.mjs")
  },
  "92b3ce5771408400e653f61f63dc4669afd568ba2be9be1f120050c7ba3ff3db": {
    functionName: "updateOfferStatus_createServerFn_handler",
    importer: () => import("./recruitment.functions-BLQMdxgM.mjs")
  },
  "3134946837fa4d46683f9f11b5e6a27ff96114bdc2a8dbc1f065d05e669dc4bb": {
    functionName: "convertCandidateToEmployee_createServerFn_handler",
    importer: () => import("./recruitment.functions-BLQMdxgM.mjs")
  },
  "0dbaea053e1757a7ed534558b46f709096b537ce85b9316c9e12ca8c44cede59": {
    functionName: "listPublicJobs_createServerFn_handler",
    importer: () => import("./recruitment.functions-BLQMdxgM.mjs")
  },
  "266a84cb8be8fd5f3d0394e2a852a4280d8f37ab35b06290d4bdaf36d30a6e78": {
    functionName: "getPublicJob_createServerFn_handler",
    importer: () => import("./recruitment.functions-BLQMdxgM.mjs")
  },
  "6871539cf2fe3cbe36116161a1ee62649eb6413b2c9eb70353578984a87fcfbc": {
    functionName: "createResumeUploadUrl_createServerFn_handler",
    importer: () => import("./recruitment.functions-BLQMdxgM.mjs")
  },
  "e3d42cf1c4c9fa18afd76285dd595efd035d2102ffd2c44a0d97b27dd0d687b2": {
    functionName: "applyToJob_createServerFn_handler",
    importer: () => import("./recruitment.functions-BLQMdxgM.mjs")
  },
  "549b7b67aa914c962358e207fe3ee563e965bb7d761b0acdcd0b0ce6008e3f0d": {
    functionName: "listOrgTrialInvitations_createServerFn_handler",
    importer: () => import("./super-invitations.functions-d7wdfQmW.mjs")
  },
  "257aca8147aa7dd6506517666f795170bf9989b99efb44afa2819e61d311f9cb": {
    functionName: "createOrgTrialInvitation_createServerFn_handler",
    importer: () => import("./super-invitations.functions-d7wdfQmW.mjs")
  },
  "13c2ac19bfc110cacfd6f62d2c73a3b7ad6c340e02dac9c0c13b8a46066ea3ca": {
    functionName: "revokeOrgTrialInvitation_createServerFn_handler",
    importer: () => import("./super-invitations.functions-d7wdfQmW.mjs")
  },
  "d04c081c85ad790202ab4d59ca4c2013da3e440947acf3112ddab0d9836a7cae": {
    functionName: "resendOrgTrialInvitation_createServerFn_handler",
    importer: () => import("./super-invitations.functions-d7wdfQmW.mjs")
  },
  "4be2cf77070da0fe2d90137016aa7f349161c398852eb117d1d5c033b4d7e0ae": {
    functionName: "getMyTrialInvitation_createServerFn_handler",
    importer: () => import("./super-invitations.functions-d7wdfQmW.mjs")
  },
  "fa86559289c74a7160b2a69e965649a1d27bec26f3279805304d282039a976fe": {
    functionName: "redeemMyTrialInvitation_createServerFn_handler",
    importer: () => import("./super-invitations.functions-d7wdfQmW.mjs")
  },
  "cd831133bbf354e001b73bb46a3ee2bb736b33513d60c43e91a8b5c40faca60a": {
    functionName: "getMyOnboardingProfile_createServerFn_handler",
    importer: () => import("./staff-onboarding.functions-B0Wh2zXZ.mjs")
  },
  "81d395a527764c23ab74cad1cab11860cc5df11ec157f777bbdd516e910c0e98": {
    functionName: "upsertMyOnboardingProfile_createServerFn_handler",
    importer: () => import("./staff-onboarding.functions-B0Wh2zXZ.mjs")
  },
  "42d3e0a1777d41a78dcc6600255e69510ae86dc08fd86634c62cf6d6ce66d79c": {
    functionName: "trackCareersEvent_createServerFn_handler",
    importer: () => import("./careers-analytics.functions-B53m9nMJ.mjs")
  },
  "4a60a5f8bb3db34352b3f00ea34128a5f19f42dc0e04ee585fd0b3482ed3a077": {
    functionName: "getCareersAnalytics_createServerFn_handler",
    importer: () => import("./careers-analytics.functions-B53m9nMJ.mjs")
  },
  "433e258188ae53b7c0191d5fbb7b72126ecd201401245dd282f544da490a0dbb": {
    functionName: "logBlogAccessAttempt_createServerFn_handler",
    importer: () => import("./blog.functions-DeZw8cdE.mjs")
  },
  "eb404470d2144d59004dadac2858374fdd883cb7d710cde218a869f56256b015": {
    functionName: "listAdminPosts_createServerFn_handler",
    importer: () => import("./blog.functions-DeZw8cdE.mjs")
  },
  "cc5d62f2c2167ae3fac996611f1c212c9eef4c5bba9e0ccce81cf270a4dd66ab": {
    functionName: "getAdminPost_createServerFn_handler",
    importer: () => import("./blog.functions-DeZw8cdE.mjs")
  },
  "c79b265bf8b5cbe1e3a96456e7f15d2e1d4776703c5081baca8c3ca84d3396f0": {
    functionName: "upsertPost_createServerFn_handler",
    importer: () => import("./blog.functions-DeZw8cdE.mjs")
  },
  "3843831164d0def4cb3afbf32fde4fbd1ac8c93e12b37a3c66d852aa39340c0d": {
    functionName: "deletePost_createServerFn_handler",
    importer: () => import("./blog.functions-DeZw8cdE.mjs")
  },
  "8bf11339de321924fac14bfd28030a1559f57319cba9e686b2740d135f6f6e8d": {
    functionName: "listCategories_createServerFn_handler",
    importer: () => import("./blog.functions-DeZw8cdE.mjs")
  },
  "19900ef92794213055c03d7158ef306d2caafe8df9a9ede72d9e25a0e31937d9": {
    functionName: "listApiKeys_createServerFn_handler",
    importer: () => import("./blog.functions-DeZw8cdE.mjs")
  },
  "adaf7648ff4e7d59d5ca8f8f77a420f2d2e4d24a9d3fd04db29ea02e0d718588": {
    functionName: "createApiKey_createServerFn_handler",
    importer: () => import("./blog.functions-DeZw8cdE.mjs")
  },
  "71826642922ceb648aa25339e920a6c0d827957ba66820f0645dfa4be1a67c68": {
    functionName: "revokeApiKey_createServerFn_handler",
    importer: () => import("./blog.functions-DeZw8cdE.mjs")
  },
  "34a83ed382ea82139d2bf1bd77c067a1e6916f647f9cd8bd2830970e7286a28d": {
    functionName: "listWebhooks_createServerFn_handler",
    importer: () => import("./blog.functions-DeZw8cdE.mjs")
  },
  "2015f29c65cc7436d5792ee2e6e64c8afbe308bbd909a53777cc99fe11f74a5c": {
    functionName: "upsertWebhook_createServerFn_handler",
    importer: () => import("./blog.functions-DeZw8cdE.mjs")
  },
  "deeb97f5c1e0d576dcb574454d69c9ac9dcdcac04ff39c767c44a29a8af7c5bc": {
    functionName: "deleteWebhook_createServerFn_handler",
    importer: () => import("./blog.functions-DeZw8cdE.mjs")
  },
  "ca45231f5b6d9bbb28cdec444aff051557b9bfa47ac9e618adf8b43795dae463": {
    functionName: "rotateWebhookSecret_createServerFn_handler",
    importer: () => import("./blog.functions-DeZw8cdE.mjs")
  },
  "e2cbed737503162e46e2ab3f882490859e69491c19f9c07d7dd3510044f18adc": {
    functionName: "listPublishedPosts_createServerFn_handler",
    importer: () => import("./blog.functions-DeZw8cdE.mjs")
  },
  "5e47b6b5462336cd213aaf587762c19db3f76ae26cbad921e5799a17bbfd9e41": {
    functionName: "getPublishedPost_createServerFn_handler",
    importer: () => import("./blog.functions-DeZw8cdE.mjs")
  },
  "71f61232156b706f6a2749a4a767f5e5738919c2cbaa8365e943a64dc8cb1a18": {
    functionName: "listTenantMembers_createServerFn_handler",
    importer: () => import("./role-management.functions-BSHEKjIQ.mjs")
  },
  "9f77007c354294e7938955a054e3c391090cc3e1bdf312ff31b8341e18edd06a": {
    functionName: "grantRole_createServerFn_handler",
    importer: () => import("./role-management.functions-BSHEKjIQ.mjs")
  },
  "3f6b9b7bb13dc62b0bc0ef5e7709e8178d54fb985686229978eca3b2cb4d02e7": {
    functionName: "revokeRole_createServerFn_handler",
    importer: () => import("./role-management.functions-BSHEKjIQ.mjs")
  },
  "cf973901b6711ff3340f683aed87dae58a28557a1cdbbf8e2a52a5e865e7d94a": {
    functionName: "setBranchScope_createServerFn_handler",
    importer: () => import("./role-management.functions-BSHEKjIQ.mjs")
  },
  "a6adf36d1adb34fb77fa572d57a58cbbae78af0d62587ba518d3f0b02c45bcd9": {
    functionName: "getPayrollSetup_createServerFn_handler",
    importer: () => import("./payroll-setup.functions-B_A_5gLf.mjs")
  },
  "2c19fd0a5f8207bef3e74331a09206a9c28244bd851a8d3b2e1b4df589656434": {
    functionName: "upsertPayrollSettings_createServerFn_handler",
    importer: () => import("./payroll-setup.functions-B_A_5gLf.mjs")
  },
  "dcf8bd5016566210843cae6e61dd5795a1d03f8ecc2bea105aa4e0a0ff0cbb4d": {
    functionName: "upsertPayrollComponent_createServerFn_handler",
    importer: () => import("./payroll-setup.functions-B_A_5gLf.mjs")
  },
  "d1701c3028759d86cd5e5b044aee6adb9e6d50ef574370b596a5c3052f1493cc": {
    functionName: "togglePayrollComponent_createServerFn_handler",
    importer: () => import("./payroll-setup.functions-B_A_5gLf.mjs")
  },
  "95b63901aea3f1449bdb2f0be85118a76e8fe65e8e6bde191bc08edb6a5f25d6": {
    functionName: "deletePayrollComponent_createServerFn_handler",
    importer: () => import("./payroll-setup.functions-B_A_5gLf.mjs")
  },
  "153b617cf3be7df9d9bf9710f584141e1718961dbf6e7d093d61582c6e1daa5c": {
    functionName: "logPayrollScenarioEvent_createServerFn_handler",
    importer: () => import("./payroll-setup.functions-B_A_5gLf.mjs")
  },
  "1bc5fed8d9e6a30b23c064200fc9b1ea8cfdfb3a85e71607db9efdaa03a552b2": {
    functionName: "logPayrollExportEvent_createServerFn_handler",
    importer: () => import("./payroll-setup.functions-B_A_5gLf.mjs")
  },
  "f0af8d406b266cde10fec5fb5c9df453365273293ff00184715db2cc076ccb43": {
    functionName: "getAdminAuditLog_createServerFn_handler",
    importer: () => import("./payroll-setup.functions-B_A_5gLf.mjs")
  },
  "2fc9c4b3a55c1ac37059d347d3c99fe8384b6fd2289cc1e0c606a648dae958ab": {
    functionName: "getPayrollExportBundle_createServerFn_handler",
    importer: () => import("./payroll-setup.functions-B_A_5gLf.mjs")
  },
  "5e887b2708b73fb1e633ee372484d5225cfe937f4ad0d1528d5d2a27f694af72": {
    functionName: "getPayrollReadiness_createServerFn_handler",
    importer: () => import("./payroll-setup.functions-B_A_5gLf.mjs")
  },
  "2efed6893352772ab3a4adae778de20436cc4447d1cc5020d6dd1de55fdd8c3d": {
    functionName: "updateTenantCurrency_createServerFn_handler",
    importer: () => import("./payroll-setup.functions-B_A_5gLf.mjs")
  },
  "43941ed53770ebac6c3bbd95ee8a6f1195f434bd954224e74842e8336d5e393b": {
    functionName: "upsertOvertimeRateQuick_createServerFn_handler",
    importer: () => import("./payroll-setup.functions-B_A_5gLf.mjs")
  },
  "956ae30622c5d1d1e6ca4d6bab16766b3f1d2b1f577355f4fb2674d8bf524ef5": {
    functionName: "getOvertimeReadiness_createServerFn_handler",
    importer: () => import("./payroll-setup.functions-B_A_5gLf.mjs")
  },
  "0b5282aca31a1d767e13c24f658d89e703676ba9c078f8744c3a270e95466366": {
    functionName: "createSupportTicket_createServerFn_handler",
    importer: () => import("./support-tickets.functions-BscO2sVq.mjs")
  },
  "fe997652390cfcb14fb1971b8fa25db964aa0a977bdd606e32b3d67b180cdd7a": {
    functionName: "listMyTickets_createServerFn_handler",
    importer: () => import("./support-tickets.functions-BscO2sVq.mjs")
  },
  "cefbeacd2a2228987fae1cf6b14c4de86a243d2874e4bf0051d156c976a51a09": {
    functionName: "listInboxTickets_createServerFn_handler",
    importer: () => import("./support-tickets.functions-BscO2sVq.mjs")
  },
  "e8dc933efa46d994fe0783c59e49d32d3afb61379495a1549e8e278e2edcedcd": {
    functionName: "updateTicketStatus_createServerFn_handler",
    importer: () => import("./support-tickets.functions-BscO2sVq.mjs")
  },
  "1e1572f243a904bd9daa9285583017cc9de6797880039f6e1dce35b0ed9f6271": {
    functionName: "addTicketComment_createServerFn_handler",
    importer: () => import("./support-tickets.functions-BscO2sVq.mjs")
  },
  "c41664165ed31b44d7bd6d12a64d858dcc73c57e927511b6329a007f3e288fd9": {
    functionName: "listTicketComments_createServerFn_handler",
    importer: () => import("./support-tickets.functions-BscO2sVq.mjs")
  },
  "4f6fbd45edcb117fec1c70cf749babd1003e48ca426a536091b64d291aee815d": {
    functionName: "listTenantInvitations_createServerFn_handler",
    importer: () => import("./staff-invitations.functions-BgnzwOye.mjs")
  },
  "a9239ef5daac8dddedc280577c76a3753b09a1218e6ee80aff16ee8a2a3238ee": {
    functionName: "inviteStaff_createServerFn_handler",
    importer: () => import("./staff-invitations.functions-BgnzwOye.mjs")
  },
  "87e36ca08358a7227cfc910a4c1f8332c2ccb450676a61ae8bdd17a563c985b3": {
    functionName: "resendInvitation_createServerFn_handler",
    importer: () => import("./staff-invitations.functions-BgnzwOye.mjs")
  },
  "fe8d3bad88fc7c31ce6824aa94300542579a52d2a40a82d8dd1ee8d42b22d271": {
    functionName: "revokeInvitation_createServerFn_handler",
    importer: () => import("./staff-invitations.functions-BgnzwOye.mjs")
  },
  "19f515a6b7800389dfe5431779c7ff86d680a4606c99a413225a7fa6fab130a1": {
    functionName: "getInvitationByToken_createServerFn_handler",
    importer: () => import("./staff-invitations.functions-BgnzwOye.mjs")
  },
  "a56337699d832b351c042f89f479c3a70280d7f81ecc52d7371d971e6a61cc02": {
    functionName: "acceptInvitation_createServerFn_handler",
    importer: () => import("./staff-invitations.functions-BgnzwOye.mjs")
  },
  "4823694e81cc628243ce310a62814ff9f72b20b4e8fa308dbbe9cf84860215c5": {
    functionName: "listPlans_createServerFn_handler",
    importer: () => import("./billing.functions-vLYMKg0P.mjs")
  },
  "6bad32af0e31b7572f177d7091dc654cec925dff506e01bc18378bfda76ca5c8": {
    functionName: "getMyBilling_createServerFn_handler",
    importer: () => import("./billing.functions-vLYMKg0P.mjs")
  },
  "5a84c843e1e0327816d1cd280d2324c703184fe899c526aa06e6294208d7e392": {
    functionName: "changeMyPlan_createServerFn_handler",
    importer: () => import("./billing.functions-vLYMKg0P.mjs")
  },
  "0fecd8c9bcd50441bd48f1a05583b3ab9a4c5effa14c058075aa600bb39414a0": {
    functionName: "cancelMyPlan_createServerFn_handler",
    importer: () => import("./billing.functions-vLYMKg0P.mjs")
  },
  "220592c9aac99e25d1110a8f24aa98663b19bd1e29a4a7976f4e013429848ab2": {
    functionName: "resumeMyPlan_createServerFn_handler",
    importer: () => import("./billing.functions-vLYMKg0P.mjs")
  },
  "0927b2916a315fddf86b55e3fd93ce3f84d757e2936cb3de510f7fe719af3446": {
    functionName: "startTenantSubscription_createServerFn_handler",
    importer: () => import("./billing.functions-vLYMKg0P.mjs")
  },
  "acec9810c09fe9304bcd76ddcb4ea35d766b86016561451ef285d48d7f7ee1ab": {
    functionName: "createBillingSetupLink_createServerFn_handler",
    importer: () => import("./billing.functions-vLYMKg0P.mjs")
  },
  "e24c5fc507076f6fa09115878246ddf7f869912451c6f62ba1139e8077f3169d": {
    functionName: "reportMonthlyUsageForTenant_createServerFn_handler",
    importer: () => import("./billing.functions-vLYMKg0P.mjs")
  },
  "d93e92de1459204136fbc82c7513cd6b8173025afea2fe04d3d02d4ba55e0d73": {
    functionName: "previewTenantHeadcount_createServerFn_handler",
    importer: () => import("./billing.functions-vLYMKg0P.mjs")
  },
  "13aa229a7d5ca150d6b72f2da8147624eb2e3430f362730f013eaddc7f0cfa8e": {
    functionName: "listTenantBillingSnapshots_createServerFn_handler",
    importer: () => import("./billing.functions-vLYMKg0P.mjs")
  },
  "df248d70e7ba472a204ac737aac4b82ab72dd79f3bd65cf11d8486174c3c3c56": {
    functionName: "listExpenseCategories_createServerFn_handler",
    importer: () => import("./expenses.functions-C98WnUtm.mjs")
  },
  "f4de4516b2c1547cbb0dc602c6aaf3aec76d5b9414886c376e7e4e57214afe06": {
    functionName: "upsertExpenseCategory_createServerFn_handler",
    importer: () => import("./expenses.functions-C98WnUtm.mjs")
  },
  "16010eda1bf207b64d842c5c9a391470b3f5f10676314c4e7b0b376083924165": {
    functionName: "deleteExpenseCategory_createServerFn_handler",
    importer: () => import("./expenses.functions-C98WnUtm.mjs")
  },
  "69776eba036ece29abe3c9a7737d90b05f2544744c64833c087d157f1518de64": {
    functionName: "listApprovalRules_createServerFn_handler",
    importer: () => import("./expenses.functions-C98WnUtm.mjs")
  },
  "1924a592c52c343422451709e61ac8ea767e5aad86d972d183f47eac467fb545": {
    functionName: "upsertApprovalRule_createServerFn_handler",
    importer: () => import("./expenses.functions-C98WnUtm.mjs")
  },
  "90e5b8211985a8957045e1b46fa6c8376112ed077e88bad97c5bf618b69abb58": {
    functionName: "deleteApprovalRule_createServerFn_handler",
    importer: () => import("./expenses.functions-C98WnUtm.mjs")
  },
  "4d743ffecd340f7024df319a87c52897639c9ef5b5f89cfd7330003f418a3e65": {
    functionName: "previewClaimRouting_createServerFn_handler",
    importer: () => import("./expenses.functions-C98WnUtm.mjs")
  },
  "ddfcbcbe194e1dfa9949b021727ae6d89ddd50ae1ecb9f18f2a4553b36c2497c": {
    functionName: "listExpenseClaims_createServerFn_handler",
    importer: () => import("./expenses.functions-C98WnUtm.mjs")
  },
  "54a90270c9a8fd84751fd2b4bebcb481ce82c4c4621bd6effc247b2474b94f0e": {
    functionName: "getExpenseClaim_createServerFn_handler",
    importer: () => import("./expenses.functions-C98WnUtm.mjs")
  },
  "540b5df087f4237dc47c0be6959abc1e8f1b0a2104c0790909bd8f7523b9cf25": {
    functionName: "saveExpenseClaim_createServerFn_handler",
    importer: () => import("./expenses.functions-C98WnUtm.mjs")
  },
  "16adaf98fff2071248d3c45daba2b6e12d9d6b24584dc2cc94dce2d2a1398be3": {
    functionName: "decideExpenseClaim_createServerFn_handler",
    importer: () => import("./expenses.functions-C98WnUtm.mjs")
  },
  "c93b449e2879fee347404c21adff5aad2323e3b3695820f175b387b86b882324": {
    functionName: "deleteExpenseClaim_createServerFn_handler",
    importer: () => import("./expenses.functions-C98WnUtm.mjs")
  },
  "1485f882bb6917f22e1e0d6ffe335b359de2a870f7b308fef6ac2fbd1eaa8337": {
    functionName: "getReceiptSignedUrl_createServerFn_handler",
    importer: () => import("./expenses.functions-C98WnUtm.mjs")
  },
  "ee609298f5c3d2e25d65cd6f74b822627fdf4d27737fe07fe0b6a9e2d4ce325a": {
    functionName: "getReimbursementSummary_createServerFn_handler",
    importer: () => import("./expenses.functions-C98WnUtm.mjs")
  },
  "052d2d56ddfbea3d8df3bf69029bb1ef83cbedde6bf27a66581e21e44f43ccc5": {
    functionName: "listEmployeeTimeline_createServerFn_handler",
    importer: () => import("./timeline.functions-DHPPk-6F.mjs")
  },
  "d51047ee80647fcbcd1c43342b8e0127beaefea7f8711f1575a7cc34eafe2b6d": {
    functionName: "linkEvents_createServerFn_handler",
    importer: () => import("./timeline.functions-DHPPk-6F.mjs")
  },
  "b97a74db99c229a97ea2a0b89a831b3e193861f85f50202832619a34790b6c3d": {
    functionName: "recordCustomEvent_createServerFn_handler",
    importer: () => import("./timeline.functions-DHPPk-6F.mjs")
  },
  "bfca804f13447d2f0dc0da9e3cecb9e05d5551caacf9ce524ce74e10eaaaf3f7": {
    functionName: "listEmployeesForAdmin_createServerFn_handler",
    importer: () => import("./timeline.functions-DHPPk-6F.mjs")
  },
  "46133b391f80385fff9b352fdf34b66e211b4871590fc93dad68fc24d6ae42d7": {
    functionName: "myEmployeeId_createServerFn_handler",
    importer: () => import("./timeline.functions-DHPPk-6F.mjs")
  },
  "3a8e6bb94398f28b446fa84c62ee9ff68c455e86d3b97f4cbcb7bbe2b8e1c8ad": {
    functionName: "getLeaveReadiness_createServerFn_handler",
    importer: () => import("./leave-setup.functions-C03v5DmU.mjs")
  },
  "e9f61609fbf28968dd24e9432e7b3a990ea32ccf81d8342246ef2d46f782ca49": {
    functionName: "upsertLeaveTypeQuick_createServerFn_handler",
    importer: () => import("./leave-setup.functions-C03v5DmU.mjs")
  },
  "b30f27cee2d74a06a1da9dc53a6189d7ca46c19d465305b9a4fd54c6e62a7071": {
    functionName: "listLeaveApprovalRoutes_createServerFn_handler",
    importer: () => import("./leave-setup.functions-C03v5DmU.mjs")
  },
  "c1986285be9c7c50b0c21b05419094753636d306d8f606ea4b4ece25c0319faa": {
    functionName: "upsertLeaveApprovalRoute_createServerFn_handler",
    importer: () => import("./leave-setup.functions-C03v5DmU.mjs")
  },
  "94f2dfdb64609e11aae4493602e8a57abc88f046f26097c9c8d14bb569bd1192": {
    functionName: "deleteLeaveApprovalRoute_createServerFn_handler",
    importer: () => import("./leave-setup.functions-C03v5DmU.mjs")
  },
  "32b414a7c4eb29293f430a354f70cd3c5fe04d7f0d556db8e7fbfe1a1c21baab": {
    functionName: "listTenantApprovers_createServerFn_handler",
    importer: () => import("./leave-setup.functions-C03v5DmU.mjs")
  },
  "7c8c04f9b97e895f756963cd8788d397e8eeafd37caf3f9dce935c4d2ad87b85": {
    functionName: "getMyOrgStatus_createServerFn_handler",
    importer: () => import("./org-signup.functions-bjtUv85I.mjs")
  },
  "f4cf7e338edff3096390043e75330342e0cf10216d426c1abef0a029bd7af291": {
    functionName: "getMyGateStatus_createServerFn_handler",
    importer: () => import("./org-signup.functions-bjtUv85I.mjs")
  },
  "ade327610be33474957676510b7908c27c6c147b972fefc9c429006a6113bbf2": {
    functionName: "createOrganization_createServerFn_handler",
    importer: () => import("./org-signup.functions-bjtUv85I.mjs")
  },
  "3ccb4e88c8f860d7f444773904575501cc69be2a14778af5e01fc030d3795a60": {
    functionName: "updateOrganizationProfile_createServerFn_handler",
    importer: () => import("./org-signup.functions-bjtUv85I.mjs")
  },
  "937c92ae7566598ba1ab50fa0dbfcd444ac89df6cfd14f6e7b9874440f38c54c": {
    functionName: "markSetupStep_createServerFn_handler",
    importer: () => import("./org-signup.functions-bjtUv85I.mjs")
  },
  "08807eaea5098b595bd997b9687cbd4994ba7d625aecf537fd7a4c553d5e53c5": {
    functionName: "seedOrgDefaults_createServerFn_handler",
    importer: () => import("./org-signup.functions-bjtUv85I.mjs")
  },
  "ca815b6f41830c534cf0bf8dcf97cf99d787bae94b7d8ba7d561fefc3717ed3c": {
    functionName: "resetMyOrgSetup_createServerFn_handler",
    importer: () => import("./org-signup.functions-bjtUv85I.mjs")
  },
  "69999f72a81b4de818dd9a4661f95bb166df8c521bce4bce601ccd2d2e99db5b": {
    functionName: "getAuditDetail_createServerFn_handler",
    importer: () => import("./audit-detail.functions-BA_b4en9.mjs")
  },
  "84b76b421f303fd36d3d8516f553cae1c66717315aa2640e650c474426069888": {
    functionName: "listSecurityFindings_createServerFn_handler",
    importer: () => import("./security-findings.functions-B8deTuLV.mjs")
  },
  "55630717fb199814372660828ad3f15c4fe1d56499e6def30733cbfd09634f2c": {
    functionName: "recordSecurityFinding_createServerFn_handler",
    importer: () => import("./security-findings.functions-B8deTuLV.mjs")
  },
  "48eff560eb518d23570caa8ae0919e66e0b297193a894a546a7f0ebe69b501c5": {
    functionName: "updateSecurityFindingStatus_createServerFn_handler",
    importer: () => import("./security-findings.functions-B8deTuLV.mjs")
  },
  "d940dd41ade46aca14a26c02992a9fe9c02a4433ad6aa71c9748f62fd2099049": {
    functionName: "countOpenHighSeverityFindings_createServerFn_handler",
    importer: () => import("./security-findings.functions-B8deTuLV.mjs")
  },
  "952fac3e24d750ac56a27b3b83e48f7a74200e8977398f31eed74b8e67c09205": {
    functionName: "listTeamData_createServerFn_handler",
    importer: () => import("./team-assignments.functions-BkC-ae9Y.mjs")
  },
  "b93f108d8422d2ad941979d287acd49bc0965c78a1d5a18f125017c5fa2dce33": {
    functionName: "setManagerRole_createServerFn_handler",
    importer: () => import("./team-assignments.functions-BkC-ae9Y.mjs")
  },
  "a26f6c54629d42b97358b5bd364456fc7709183f8ab226884cb016662156dcf3": {
    functionName: "assignReports_createServerFn_handler",
    importer: () => import("./team-assignments.functions-BkC-ae9Y.mjs")
  },
  "c963549d5a7a6d6e82fbaa75d59a1551df31f9c01de99a84ff4b5c7520168a79": {
    functionName: "getMeOverview_createServerFn_handler",
    importer: () => import("./me.functions-DktWjAuR.mjs")
  },
  "a4afb90e71eabaf5a0a75e388e9bbf040a1666191e0b46ac30c834e53a6c955c": {
    functionName: "updateMyContactDetails_createServerFn_handler",
    importer: () => import("./me.functions-DktWjAuR.mjs")
  },
  "0b6c705f84eb0cc52219ea54940b7cba31fccc2a9e1512ffb7774ab2c657ad57": {
    functionName: "updateMyBankingTax_createServerFn_handler",
    importer: () => import("./me.functions-DktWjAuR.mjs")
  },
  "f8d4e0adcd0ceb0b5cebe3ba0f26156cde04c74de56fe9046b61d7785bd62bc6": {
    functionName: "listMyDocuments_createServerFn_handler",
    importer: () => import("./me.functions-DktWjAuR.mjs")
  },
  "6a82e13a2e4a96f96d658fc4ba1372b4187a72f293da2bb443c1c1201d32cda9": {
    functionName: "registerMyDocument_createServerFn_handler",
    importer: () => import("./me.functions-DktWjAuR.mjs")
  },
  "ea5e35d9f5bd88316fa9531ebbf4708a649aa831a61ea4c7fddad82c950fde35": {
    functionName: "createMyDocumentDownloadUrl_createServerFn_handler",
    importer: () => import("./me.functions-DktWjAuR.mjs")
  },
  "73206aa8188ad1463ae0a0e7ff2704c751b0fa5a5903d2d0a20af855db0c5c1b": {
    functionName: "deleteMyDocument_createServerFn_handler",
    importer: () => import("./me.functions-DktWjAuR.mjs")
  },
  "12c7bd0fb0d5d2db104457f338805fb6f1b878bebedddab8dd7034b65c1a4db3": {
    functionName: "getCompanyDirectory_createServerFn_handler",
    importer: () => import("./me.functions-DktWjAuR.mjs")
  },
  "ec6dbdedf18afd1b51e40003b9f058802097c720ca58d5d4e70cb6974a675ece": {
    functionName: "getMyTeam_createServerFn_handler",
    importer: () => import("./me.functions-DktWjAuR.mjs")
  },
  "0cbdbd4d0a5f60c0ab6362f75d90f21231bd26e0f696acdbcc79835080e5e1d8": {
    functionName: "listDesignations_createServerFn_handler",
    importer: () => import("./hr-extras.functions-CmShMGP8.mjs")
  },
  "676f2683c7cdd2e7642ed4cf01b85da58b5c9c7cbd904aecbf24147789a4295e": {
    functionName: "upsertDesignation_createServerFn_handler",
    importer: () => import("./hr-extras.functions-CmShMGP8.mjs")
  },
  "d062cf7b6d55e9d7cc7ccb1dd6530cd9e2d77b6417b2607c51ae5c671ece5ebc": {
    functionName: "deleteDesignation_createServerFn_handler",
    importer: () => import("./hr-extras.functions-CmShMGP8.mjs")
  },
  "8b3a98be6db256140695576d620a272ac657e412b419627345a9f22518a36993": {
    functionName: "seedDesignationPreset_createServerFn_handler",
    importer: () => import("./hr-extras.functions-CmShMGP8.mjs")
  },
  "d7eb527e9a7a072a13b24eb93e3a78586c86ca52671028c7a9cc4e833aedf1d0": {
    functionName: "proposePromotion_createServerFn_handler",
    importer: () => import("./hr-extras.functions-CmShMGP8.mjs")
  },
  "030df4639beacc16c4f915d56b0974a525ac5339e10b0dd5c66e787835e5245c": {
    functionName: "listPromotions_createServerFn_handler",
    importer: () => import("./hr-extras.functions-CmShMGP8.mjs")
  },
  "eedd818ad7a8269a4b7c32cbfe68713905765b1dc9a7399bbed567ca023941a8": {
    functionName: "decidePromotion_createServerFn_handler",
    importer: () => import("./hr-extras.functions-CmShMGP8.mjs")
  },
  "37b8240ff9154a0c473a86b84f694031f5361a927422ce203c31a2aeb089037b": {
    functionName: "proposePayRate_createServerFn_handler",
    importer: () => import("./hr-extras.functions-CmShMGP8.mjs")
  },
  "f6dd5083cf5b4bfd97543c8e96d000094ccd7b6488daf25b942a012964c333ce": {
    functionName: "listPayRateChanges_createServerFn_handler",
    importer: () => import("./hr-extras.functions-CmShMGP8.mjs")
  },
  "2cf2950ccb7fb5dbed89bb186b50103c6138ca80e104466c55093d7179ca2bf1": {
    functionName: "decidePayRate_createServerFn_handler",
    importer: () => import("./hr-extras.functions-CmShMGP8.mjs")
  },
  "0074b036524ba650fb345e382e72b03e175f39d56ddac0d95f5a29a230a3223d": {
    functionName: "listAppreciations_createServerFn_handler",
    importer: () => import("./hr-extras.functions-CmShMGP8.mjs")
  },
  "ed39086562532ce601003e0fbf8507fd1c407d3aab50e1f3a806c3da563f5afd": {
    functionName: "createAppreciation_createServerFn_handler",
    importer: () => import("./hr-extras.functions-CmShMGP8.mjs")
  },
  "6df4964c2b59d339639f05a04dc32ca5f010d0854e31db82761186e2d38c74b9": {
    functionName: "toggleAppreciationReaction_createServerFn_handler",
    importer: () => import("./hr-extras.functions-CmShMGP8.mjs")
  },
  "caac7defbea870ac1f99338a153484e0827a8eecfdc28bebcd879e974b10f0a5": {
    functionName: "listAwardTypes_createServerFn_handler",
    importer: () => import("./hr-extras.functions-CmShMGP8.mjs")
  },
  "464d54df7bf62cea89ffa9f79a1064f38d2e0f1daa203fccc22e0524dfc38995": {
    functionName: "upsertAwardType_createServerFn_handler",
    importer: () => import("./hr-extras.functions-CmShMGP8.mjs")
  },
  "cd4b3138d67c5cc43be53720a3721fccc3ead655c731ef3ecf03d9fe99834e27": {
    functionName: "listAwardCycles_createServerFn_handler",
    importer: () => import("./hr-extras.functions-CmShMGP8.mjs")
  },
  "d0373c44b753b4cff3cb930aa346716db019f2a190c27a33766a6c7a3777af64": {
    functionName: "upsertAwardCycle_createServerFn_handler",
    importer: () => import("./hr-extras.functions-CmShMGP8.mjs")
  },
  "721227d4ba2d8aa84a6e26cb5a8feaa30f2dce151e3e715ded097f8bcbe4d7cd": {
    functionName: "nominateForAward_createServerFn_handler",
    importer: () => import("./hr-extras.functions-CmShMGP8.mjs")
  },
  "e0b2dd59b4f63768a3075043c7e8ed20151ab1861f46d42aa5f926a48ba7fcca": {
    functionName: "listNominations_createServerFn_handler",
    importer: () => import("./hr-extras.functions-CmShMGP8.mjs")
  },
  "9923291689cf5b870884e70f365addbc95aaca08921238701b29ae49dc911ff9": {
    functionName: "decideNomination_createServerFn_handler",
    importer: () => import("./hr-extras.functions-CmShMGP8.mjs")
  },
  "cb61fa41499009895ad01460420f0488d39e5984bf628cea4653055ddcf2b175": {
    functionName: "listAwardsGranted_createServerFn_handler",
    importer: () => import("./hr-extras.functions-CmShMGP8.mjs")
  },
  "10129f858432cd1f88218334882b6bb9eb3b1b8ddb7e65b65aa0c2458f6e045c": {
    functionName: "getEmployeeTimeline_createServerFn_handler",
    importer: () => import("./hr-extras.functions-CmShMGP8.mjs")
  },
  "b8423a62444702e0a68281ff411a515581c85f7a922b62d11314b8163926441a": {
    functionName: "getEmployeePayHistory_createServerFn_handler",
    importer: () => import("./hr-extras.functions-CmShMGP8.mjs")
  },
  "6bcc10afef8865f2a80c3359bee108eb93aedac9514c3f4160e132caa87c9e35": {
    functionName: "listHolidayCategories_createServerFn_handler",
    importer: () => import("./holiday-categories.functions-CTtj5EbC.mjs")
  },
  "97cd0df4fbc8c8688ace62b307bfa10343759a152b338fbdbdb6b6ca15e630d6": {
    functionName: "upsertHolidayCategory_createServerFn_handler",
    importer: () => import("./holiday-categories.functions-CTtj5EbC.mjs")
  },
  "90cb15cd2d216308a375ab77d2680e1c622e1405181a5466663adee84080f315": {
    functionName: "deleteHolidayCategory_createServerFn_handler",
    importer: () => import("./holiday-categories.functions-CTtj5EbC.mjs")
  },
  "0b3cee7a0ab2556f977a5b755e78f73e0f6ed1d11bd2fce6b6f132959b097226": {
    functionName: "upsertHolidayCategoryDate_createServerFn_handler",
    importer: () => import("./holiday-categories.functions-CTtj5EbC.mjs")
  },
  "444e5e0c028ecb570f37bf3ceddb90b5b9ee3116d6e758522f442f7bdbd3cf74": {
    functionName: "deleteHolidayCategoryDate_createServerFn_handler",
    importer: () => import("./holiday-categories.functions-CTtj5EbC.mjs")
  },
  "79ec2f52cf05ac10e7748ca4e7abb48239d96c75682c9071bd96ab7534435a84": {
    functionName: "listControlRooms_createServerFn_handler",
    importer: () => import("./onboarding-control-room.functions-B26T2-B-.mjs")
  },
  "050245a3abd428191c8a287d4e85f1371caef767528f5d0316a29c4cc2c5ebb1": {
    functionName: "getControlRoom_createServerFn_handler",
    importer: () => import("./onboarding-control-room.functions-B26T2-B-.mjs")
  },
  "611afe185334706c008b04315266c98a3c7af2b07e1c5fd17cd12767140152e5": {
    functionName: "listControlRoomAudit_createServerFn_handler",
    importer: () => import("./onboarding-control-room.functions-B26T2-B-.mjs")
  },
  "3675ef2152abe6c054acbeea7c9a143c906a38660cc76384acb62d57a79c329c": {
    functionName: "upsertControlRoomTask_createServerFn_handler",
    importer: () => import("./onboarding-control-room.functions-B26T2-B-.mjs")
  },
  "d14aca7eff3ff191530a3060246faeab2548e0246edd4713ce10e507c6b293f0": {
    functionName: "completeControlRoomTask_createServerFn_handler",
    importer: () => import("./onboarding-control-room.functions-B26T2-B-.mjs")
  },
  "d1bf6f938552af8e86a607216a02dd78c91a115dc94042a852d9438f4dc4c5bf": {
    functionName: "deleteControlRoomTask_createServerFn_handler",
    importer: () => import("./onboarding-control-room.functions-B26T2-B-.mjs")
  },
  "66cea45061c4a45496b1969ce1cad0af494bff50e556a74fa3067060e9372e97": {
    functionName: "bulkUpdateAssignmentStatus_createServerFn_handler",
    importer: () => import("./onboarding-control-room.functions-B26T2-B-.mjs")
  },
  "083bc60e25d313798d8e4aafc4d1a4f079432eb9e2240b2ff6e7483f3dabfcee": {
    functionName: "listDepartments_createServerFn_handler",
    importer: () => import("./departments.functions-BOjB7kg6.mjs")
  },
  "bd4955b78082526ef9e1592320b5b397176cee778a80df4a1a46f54ee889be54": {
    functionName: "upsertDepartment_createServerFn_handler",
    importer: () => import("./departments.functions-BOjB7kg6.mjs")
  },
  "41c6d55e5c6a8c5bdd2d7aa91c98fb664d017c91e899b8f45c91a818c28d0a0a": {
    functionName: "deleteDepartment_createServerFn_handler",
    importer: () => import("./departments.functions-BOjB7kg6.mjs")
  },
  "aa6a8ca16df5c97718881ac1665d5141f202ddddd84079808cbc1c383670aaf9": {
    functionName: "listEmployeeDuties_createServerFn_handler",
    importer: () => import("./employee-duties.functions-BxHdNMCM.mjs")
  },
  "3cf80544dfcb4a7e89107071e525b2361d675e3a78c169a1dc06665dc7e2d026": {
    functionName: "listMyDuties_createServerFn_handler",
    importer: () => import("./employee-duties.functions-BxHdNMCM.mjs")
  },
  "47a18cf59d482a0f227fde352983cacf613d5fd5fec4f98f1288c3e3a121624d": {
    functionName: "upsertEmployeeDuty_createServerFn_handler",
    importer: () => import("./employee-duties.functions-BxHdNMCM.mjs")
  },
  "75d02fd99b5d6a2e0335e2fd5fd35918ef3333b2fff3b7337b8ff544f53e29bb": {
    functionName: "deleteEmployeeDuty_createServerFn_handler",
    importer: () => import("./employee-duties.functions-BxHdNMCM.mjs")
  },
  "7f05b3feee6402491dd7bc548ccb8b88ec6bdb1bdcf47fc8e12ceff6cb826c89": {
    functionName: "listEmployeesForDuties_createServerFn_handler",
    importer: () => import("./employee-duties.functions-BxHdNMCM.mjs")
  },
  "46c8b615d0fc64d22a6adb7ad83a15fff13302ed7ecdea0a63c8184afdfa0548": {
    functionName: "listTeamMembers_createServerFn_handler",
    importer: () => import("./teams.functions-78-oR0P3.mjs")
  },
  "31511fa15cd52d112388b324e6d3598afc46e9e92ddc5524b2950e7e96f22d87": {
    functionName: "listEmployeeRecord_createServerFn_handler",
    importer: () => import("./teams.functions-78-oR0P3.mjs")
  },
  "c9c31c2df543d8bfc60477a1aa8dff113e67e5a66a27e0198f54e6af2c89e06f": {
    functionName: "requestMissingDocument_createServerFn_handler",
    importer: () => import("./teams.functions-78-oR0P3.mjs")
  },
  "a6cb68553cf517c858c7ad571f392fd06ce54f5d8218d9b58044f44293034b88": {
    functionName: "cancelDocumentRequest_createServerFn_handler",
    importer: () => import("./teams.functions-78-oR0P3.mjs")
  },
  "30df93f3498b9334a5651e2e9281a235bf9f7388a90d6906c85adcbc252cd68d": {
    functionName: "approveDocumentRequest_createServerFn_handler",
    importer: () => import("./teams.functions-78-oR0P3.mjs")
  },
  "39dec211cd382844785c2f202405400fcbf326401b6e68136a0d1b7bef881032": {
    functionName: "resendDocumentRequest_createServerFn_handler",
    importer: () => import("./teams.functions-78-oR0P3.mjs")
  },
  "9f956a5b8665c04f5d1dcd861eabe996a1578383afb8939260c5e710c64f959a": {
    functionName: "bulkApproveDocumentRequests_createServerFn_handler",
    importer: () => import("./teams.functions-78-oR0P3.mjs")
  },
  "d42e8026e584921cd288473bb6579d169c454e46704fd05b1c4dacddda698b17": {
    functionName: "bulkCancelDocumentRequests_createServerFn_handler",
    importer: () => import("./teams.functions-78-oR0P3.mjs")
  },
  "a32e063520edc4817837f5df6e4419e71f39cc385dbe0857e81b0847ab2538ea": {
    functionName: "bulkResendDocumentRequests_createServerFn_handler",
    importer: () => import("./teams.functions-78-oR0P3.mjs")
  },
  "1bb86553dfedc144d277c249795c3740bcb07e30a2bc3824ccdf7aaf2fd1e50e": {
    functionName: "listAllDocumentRequests_createServerFn_handler",
    importer: () => import("./teams.functions-78-oR0P3.mjs")
  },
  "936931105481384f5d3d2bc133bc714a987ed5cb30c7ae96ee618d49bdc09e94": {
    functionName: "listRequestAudit_createServerFn_handler",
    importer: () => import("./teams.functions-78-oR0P3.mjs")
  },
  "7d1f87e6d832cd0d18219102c01098a8e39c8d1c2410f9e0fbf164fce23841b1": {
    functionName: "exportEmployeeHistoryCsv_createServerFn_handler",
    importer: () => import("./teams.functions-78-oR0P3.mjs")
  },
  "e211e8c27eee0a1053129b7769a37cb2e31b3dc869a84a1c647eee19cfb57993": {
    functionName: "submitLead_createServerFn_handler",
    importer: () => import("./leads.functions-DrH0Xc8t.mjs")
  },
  "77acd1c20769f0aaa93fdea78adabaa9f8b27285e13363740e4c85703e8554bc": {
    functionName: "listLeads_createServerFn_handler",
    importer: () => import("./leads.functions-DrH0Xc8t.mjs")
  },
  "21503154d15b2a6d3e78fc15fb27b4e450edac316c8cc25a3af7d59ecfd4a86e": {
    functionName: "updateLeadStatus_createServerFn_handler",
    importer: () => import("./leads.functions-DrH0Xc8t.mjs")
  },
  "fff7316ee9ee302d27938f5044f9e3a761857e0156611c85cac1fdced01a7350": {
    functionName: "listVariations_createServerFn_handler",
    importer: () => import("./employment-variations.functions-CFGZf3ro.mjs")
  },
  "97cb4df4f6b3448917ee29c225220b55113787af6cf23b03f64798ed4d13d323": {
    functionName: "listVariationAudit_createServerFn_handler",
    importer: () => import("./employment-variations.functions-CFGZf3ro.mjs")
  },
  "34f6a6285521e4a04689c024501e88e7d0d8bf127998e7edafa3bdb0f1491877": {
    functionName: "createVariation_createServerFn_handler",
    importer: () => import("./employment-variations.functions-CFGZf3ro.mjs")
  },
  "bfc797ec37156876a94160104faa87b48a1ef3ef00b4e30eb84699261daf4960": {
    functionName: "submitVariation_createServerFn_handler",
    importer: () => import("./employment-variations.functions-CFGZf3ro.mjs")
  },
  "4ca1ac9fb371bb54f4f38421f832a860a9d1cdd2ad9f567a4afd2fb211468fcf": {
    functionName: "approveVariation_createServerFn_handler",
    importer: () => import("./employment-variations.functions-CFGZf3ro.mjs")
  },
  "94539d0999be1703d4b95fe4ee34c4004500040ccf0cf81af7581aedac4d09f8": {
    functionName: "rejectVariation_createServerFn_handler",
    importer: () => import("./employment-variations.functions-CFGZf3ro.mjs")
  },
  "3378dedbc692f0b6ece4b74908ed6a1bda716b8d74912d010bba18afa18064ee": {
    functionName: "applyVariation_createServerFn_handler",
    importer: () => import("./employment-variations.functions-CFGZf3ro.mjs")
  },
  "e1ce1b53b0647b71269d215149e38abcaf638b1444a755ca81fea06cfbe59bc7": {
    functionName: "listEmployeesWithState_createServerFn_handler",
    importer: () => import("./employee-holidays.functions-BJxNY8VZ.mjs")
  },
  "8455ea24b0bbc76342f8af2256017cb63ecd4da8704fa047eda15f6c5dd72445": {
    functionName: "setEmployeeState_createServerFn_handler",
    importer: () => import("./employee-holidays.functions-BJxNY8VZ.mjs")
  },
  "80739c86018cb7976f578bec8ea203ae17ffc8728165ffe2e7244c484e396aad": {
    functionName: "listEmployeeHolidayPlan_createServerFn_handler",
    importer: () => import("./employee-holidays.functions-BJxNY8VZ.mjs")
  },
  "84ccf42e35621dcff62eaf43c1f495a6cf271ba6fe4fcf8f8b5e58b2f45eecaa": {
    functionName: "upsertHolidayOverride_createServerFn_handler",
    importer: () => import("./employee-holidays.functions-BJxNY8VZ.mjs")
  },
  "ed91da48068356ebd6e1d0dc23e65710bc1d7d8153ec0f729ec4ef63906438b3": {
    functionName: "deleteHolidayOverride_createServerFn_handler",
    importer: () => import("./employee-holidays.functions-BJxNY8VZ.mjs")
  },
  "81f9295736b3c453103be20a3fc9373ce07a214d9364585ed3e8684d39880ef4": {
    functionName: "createReviewCycle_createServerFn_handler",
    importer: () => import("./performance.functions-BsGtynEr.mjs")
  },
  "bbc5738d190c0fb308efac1c1c35d4a53b0e8673989cb3a3bafed876a82a49b8": {
    functionName: "activateReviewCycle_createServerFn_handler",
    importer: () => import("./performance.functions-BsGtynEr.mjs")
  },
  "f01eaf4907d4c5e2c5646434b017611ffe4ceef186b2faa4a33c73dca5cc6d2a": {
    functionName: "updateReviewCycleTemplate_createServerFn_handler",
    importer: () => import("./performance.functions-BsGtynEr.mjs")
  },
  "563a0f16affb0fab026212d2c0cb5910d775243c9ef9fbbb7f099fbdf78d3efd": {
    functionName: "closeReviewCycle_createServerFn_handler",
    importer: () => import("./performance.functions-BsGtynEr.mjs")
  },
  "ca529b66da01d8b1561e05958cde8e1818a8fc2ca4ce7cbc677a4422a44829ba": {
    functionName: "updateReviewCycleReminders_createServerFn_handler",
    importer: () => import("./performance.functions-BsGtynEr.mjs")
  },
  "8d07a91bc0ade26baede2753764241626582e36df26ec22c0eaf0b82ae2eac3e": {
    functionName: "previewReviewReminderSchedule_createServerFn_handler",
    importer: () => import("./performance.functions-BsGtynEr.mjs")
  },
  "f46b1e944a242ac4672dc085bb45cfcdde7cab8d59dbec8a43f6ba73cec189f7": {
    functionName: "upsertGoal_createServerFn_handler",
    importer: () => import("./performance.functions-BsGtynEr.mjs")
  },
  "efdefab07947169d0918629b6da9d6c728b0a03436684b27bca2b27a8ced2c66": {
    functionName: "deleteGoal_createServerFn_handler",
    importer: () => import("./performance.functions-BsGtynEr.mjs")
  },
  "4a19a4ef26793677503238e3ab4ea1e2bf8b8b3b55e6f3ac5bfb131dc093624e": {
    functionName: "submitSelfReview_createServerFn_handler",
    importer: () => import("./performance.functions-BsGtynEr.mjs")
  },
  "cbebc65c4e4ac15ef103cc2dcfe0d304db6ef5aa52ee757bab9208baf4595687": {
    functionName: "submitManagerReview_createServerFn_handler",
    importer: () => import("./performance.functions-BsGtynEr.mjs")
  },
  "3bf0861b437548d5b4a28d563199dd81165c2ffa639f26d42aa411da5a03bd1f": {
    functionName: "calibrateReview_createServerFn_handler",
    importer: () => import("./performance.functions-BsGtynEr.mjs")
  },
  "de145e8b4e54cc0cffab0c395e7bc48f0a2a37c835c00b323f6c0ae20d803683": {
    functionName: "acknowledgeReview_createServerFn_handler",
    importer: () => import("./performance.functions-BsGtynEr.mjs")
  },
  "577b803319655a9c90f59b40397ca9e6469b5ed7c501e7c6bba336eeb0af1358": {
    functionName: "addReviewFeedback_createServerFn_handler",
    importer: () => import("./performance.functions-BsGtynEr.mjs")
  },
  "70bdb04465e3960209a10887cf8624df1f34b1d8dd4a1e996a29bdb7452f1bb3": {
    functionName: "upsertReviewTemplate_createServerFn_handler",
    importer: () => import("./performance.functions-BsGtynEr.mjs")
  },
  "b76314ebe3d83aab208968e61d3e57e95a21894d484a746c55348e30eddd149d": {
    functionName: "deleteReviewTemplate_createServerFn_handler",
    importer: () => import("./performance.functions-BsGtynEr.mjs")
  },
  "add13753f71f13606fc8c20d4b151124ef9f42bb6f4488ef7c889d2129a03da4": {
    functionName: "getCycleProgress_createServerFn_handler",
    importer: () => import("./performance.functions-BsGtynEr.mjs")
  },
  "2ed294dc7be47c732fb8c18d19be294e8f0c2e53eed689a096128928877d1bcd": {
    functionName: "getReviewAuditTrail_createServerFn_handler",
    importer: () => import("./performance.functions-BsGtynEr.mjs")
  },
  "8a3cbd0762c649d4c9c8f45bce36c03bf340a5100f3d9913e98bfd84758bddf4": {
    functionName: "upsertFeedbackTemplate_createServerFn_handler",
    importer: () => import("./feedback360.functions-OLO8iqyN.mjs")
  },
  "8e4f128091dcce2cca9cc436de545dbb196b9571375614b6433ff8b3ae8ceced": {
    functionName: "deleteFeedbackTemplate_createServerFn_handler",
    importer: () => import("./feedback360.functions-OLO8iqyN.mjs")
  },
  "c1912505b88cbebe86baabd274aac8518d17029053430a81d32c7ddb0b7fe392": {
    functionName: "getFeedbackTemplateHistory_createServerFn_handler",
    importer: () => import("./feedback360.functions-OLO8iqyN.mjs")
  },
  "e2a9650cd2539a7bd9e8d26e5c179a67bbb29f89b118a4485c23eea7a8508ee2": {
    functionName: "archiveFeedbackTemplate_createServerFn_handler",
    importer: () => import("./feedback360.functions-OLO8iqyN.mjs")
  },
  "de8015cbeb820e5fdb1746d4e31234cfff692d66d49ee49d44e0e1a9a4f92c33": {
    functionName: "restoreFeedbackTemplate_createServerFn_handler",
    importer: () => import("./feedback360.functions-OLO8iqyN.mjs")
  },
  "730de2529e1bdb63993805f5f3e041f8e65dc8130d29d45476d76a3b42f53a6b": {
    functionName: "listArchivedFeedbackTemplates_createServerFn_handler",
    importer: () => import("./feedback360.functions-OLO8iqyN.mjs")
  },
  "256610d3536a5f0fe3cec696bac0039169d045fdd3e6d7aed93433501349521a": {
    functionName: "requestFeedback360_createServerFn_handler",
    importer: () => import("./feedback360.functions-OLO8iqyN.mjs")
  },
  "cc922d2989421e98b065febdf00ca598b5ac90fddb1c459193baa081ac8d532d": {
    functionName: "submitFeedback360_createServerFn_handler",
    importer: () => import("./feedback360.functions-OLO8iqyN.mjs")
  },
  "9ce21da18b3903926da35447be9545ce4b4c628dbf53926af8df8014a24cab66": {
    functionName: "declineFeedback360_createServerFn_handler",
    importer: () => import("./feedback360.functions-OLO8iqyN.mjs")
  },
  "8d97518090a7ed3678536574eb4f24bc35f04fd4088aa680f1874fbeda8a2780": {
    functionName: "sendFeedbackReminders_createServerFn_handler",
    importer: () => import("./feedback360.functions-OLO8iqyN.mjs")
  },
  "88a18470a3068bf022f3cb35cfe7da43e3a6b3492b9ab6a3cf421906f9f3037e": {
    functionName: "getFeedback360Analytics_createServerFn_handler",
    importer: () => import("./feedback360.functions-OLO8iqyN.mjs")
  },
  "ea0fcce4b3530f296c16700d87f16700c1cab5b2bef072a5383f3c53c027efc2": {
    functionName: "getFeedback360AuditTrail_createServerFn_handler",
    importer: () => import("./feedback360.functions-OLO8iqyN.mjs")
  },
  "5d2ad5d9a89cecfc947baf6cf81572b867bf939cca32893bc33769294cb36f50": {
    functionName: "listCourses_createServerFn_handler",
    importer: () => import("./training.functions-DSyVNnGO.mjs")
  },
  "4ee95b4c2a51b86d24c8d8034292dde4fc882ba13b721dfd49e14142f8215fd1": {
    functionName: "upsertCourse_createServerFn_handler",
    importer: () => import("./training.functions-DSyVNnGO.mjs")
  },
  "3db2ea82a37c3ec3c0cc7216c99ce3f2442779fbf6675fd1ccb5b063da24da1c": {
    functionName: "deleteCourse_createServerFn_handler",
    importer: () => import("./training.functions-DSyVNnGO.mjs")
  },
  "93c95edd8ee0becc18aadb6881fd09bd066f7178e381fb2672e163859608acd1": {
    functionName: "assignCourse_createServerFn_handler",
    importer: () => import("./training.functions-DSyVNnGO.mjs")
  },
  "74f7543a5e53313554c353c5a3148f9db947d5e5f8de11755e49c7be6968c060": {
    functionName: "updateEnrollment_createServerFn_handler",
    importer: () => import("./training.functions-DSyVNnGO.mjs")
  },
  "df8b29b20c68ed4d649afe2080d3d384a6e7d561fa1f78bda1fb2575ee702164": {
    functionName: "listEnrollments_createServerFn_handler",
    importer: () => import("./training.functions-DSyVNnGO.mjs")
  },
  "e9a675d4b5a818984d988108c294524932f3fb7f1a4ee56a811e44669d9638e4": {
    functionName: "deleteEnrollment_createServerFn_handler",
    importer: () => import("./training.functions-DSyVNnGO.mjs")
  },
  "1f5da21c5cb19e421adbcf77cfd7ae7cbcd6aedf81fac06eaf3f0d20b8aa4add": {
    functionName: "upsertCertification_createServerFn_handler",
    importer: () => import("./training.functions-DSyVNnGO.mjs")
  },
  "bf4b2bb75da76d89644857d9f7cd2f5958399e3d0d409cdef45a654eb9fe46d1": {
    functionName: "deleteCertification_createServerFn_handler",
    importer: () => import("./training.functions-DSyVNnGO.mjs")
  },
  "2a286373443198420f65cc93d3ae39c439bf12ad19f2979dbca7bff057fc0dbc": {
    functionName: "listCertifications_createServerFn_handler",
    importer: () => import("./training.functions-DSyVNnGO.mjs")
  },
  "4c8cf66699750f5aa13e47ad0e0f7706370b60a2cf229ac3c7a489f15559c91d": {
    functionName: "listQuestions_createServerFn_handler",
    importer: () => import("./training.functions-DSyVNnGO.mjs")
  },
  "02491caa2202d25612b7690c3b0128cec573c0df39a6673539b11f9318d70f47": {
    functionName: "copyQuestions_createServerFn_handler",
    importer: () => import("./training.functions-DSyVNnGO.mjs")
  },
  "052622096593f7deecf9e121593527dd28a8a53c722324fd7fd3f3edf42fb8db": {
    functionName: "importQuestions_createServerFn_handler",
    importer: () => import("./training.functions-DSyVNnGO.mjs")
  },
  "bfbf9f7b39b199bdc16ccb5611d30ac23d2d3ed22cb8a1c0eaea2cabf7660546": {
    functionName: "upsertQuestion_createServerFn_handler",
    importer: () => import("./training.functions-DSyVNnGO.mjs")
  },
  "e97ce8de4ecdf0f89dd81dd316d0c2af93dd783ed69333fb3b5f3c9b7dffeebb": {
    functionName: "deleteQuestion_createServerFn_handler",
    importer: () => import("./training.functions-DSyVNnGO.mjs")
  },
  "6de647560fbdccfeb000d5ed8303eb26a1354d5c037c078e77e056e00f6403ca": {
    functionName: "submitQuizAttempt_createServerFn_handler",
    importer: () => import("./training.functions-DSyVNnGO.mjs")
  },
  "fe4f2c2b021117940b396ac116e05ce1d21c9255f4f111963ebc152b235c301f": {
    functionName: "listAttempts_createServerFn_handler",
    importer: () => import("./training.functions-DSyVNnGO.mjs")
  },
  "9163631608e4f34d59fbdb4731875bac25453069222dc444772b65eb10085438": {
    functionName: "seedTrainingPreset_createServerFn_handler",
    importer: () => import("./training.functions-DSyVNnGO.mjs")
  },
  "97244842b97287c98bd5814cc6542e059421c776fb2fb4a224cd2f0507a20c33": {
    functionName: "sendOverdueTrainingReminders_createServerFn_handler",
    importer: () => import("./training.functions-DSyVNnGO.mjs")
  },
  "790a65af93936e0b362a1c57b42f24cbd2a28bb583684e9d39b15093108a8301": {
    functionName: "generateReviewInstances_createServerFn_handler",
    importer: () => import("./review-instances.functions-BZUzzagU.mjs")
  },
  "e996aa2e4316979c321bbbfecc52d2f7df38d77c7078925d12722dbe15b6955a": {
    functionName: "listMyReviewInstances_createServerFn_handler",
    importer: () => import("./review-instances.functions-BZUzzagU.mjs")
  },
  "989dff55afece2dac071e6fc2b6dbfd75e637ee622dad10d1281b880f8f0a8bd": {
    functionName: "submitReviewInstance_createServerFn_handler",
    importer: () => import("./review-instances.functions-BZUzzagU.mjs")
  },
  "e57535bb30a65d6eaac70f0ea3b7c8267d2e12d99fef3cf0203b66c9cf73ac39": {
    functionName: "resubmitReviewInstance_createServerFn_handler",
    importer: () => import("./review-instances.functions-BZUzzagU.mjs")
  },
  "88c80a0f3ead8fc28b622d847b3487e84a01eeaa27208108ed13ce6fa572744c": {
    functionName: "reviewReviewInstance_createServerFn_handler",
    importer: () => import("./review-instances.functions-BZUzzagU.mjs")
  },
  "d31900949f8a8524ca890cf6f7cbaf57d06a718d67e63a2e7cc42f8e9e34eeb2": {
    functionName: "listInstanceVersions_createServerFn_handler",
    importer: () => import("./review-instances.functions-BZUzzagU.mjs")
  },
  "71319c89323470fef0e46513cdfe7b21575e069016f5e259f98f750d7e35b8c8": {
    functionName: "logTemplateAuditEvent_createServerFn_handler",
    importer: () => import("./review-instances.functions-BZUzzagU.mjs")
  },
  "5ced16b0fc5af624ecf22b1105836c4abecf92a5913257253c6701da875a0277": {
    functionName: "listTemplateAuditLog_createServerFn_handler",
    importer: () => import("./review-instances.functions-BZUzzagU.mjs")
  },
  "fbfbc94005c6d2ccaea1bd22b821c5d1a6ea0fd0b3844729a0979fcff25be5e3": {
    functionName: "reviewDashboardSummary_createServerFn_handler",
    importer: () => import("./review-instances.functions-BZUzzagU.mjs")
  },
  "c5e9858e62caea92711f01160a6acc47174fb636c65eb4657096541c43fe6ea5": {
    functionName: "exportReviewInstances_createServerFn_handler",
    importer: () => import("./review-instances.functions-BZUzzagU.mjs")
  },
  "7f51a5219fc8951df81476267af25843fd475a7c1df5168a60c7e4fe6a240f94": {
    functionName: "listAllocationsForEntry_createServerFn_handler",
    importer: () => import("./timesheet-allocations.functions-Bs0m8GrJ.mjs")
  },
  "757b057c01942415843dc531ebba6101972e3ffb8e632f65d2ad7e8de3d502a6": {
    functionName: "saveAllocations_createServerFn_handler",
    importer: () => import("./timesheet-allocations.functions-Bs0m8GrJ.mjs")
  },
  "486023faba105228bd375162a25cd818628e1d735a081b932251b1915b3f244f": {
    functionName: "listVarianceQueue_createServerFn_handler",
    importer: () => import("./timesheet-allocations.functions-Bs0m8GrJ.mjs")
  },
  "6b87c57029cc93f0a04881ab18c960ee70b6836ec0dd50248495fde164f3755b": {
    functionName: "allocationRollup_createServerFn_handler",
    importer: () => import("./timesheet-allocations.functions-Bs0m8GrJ.mjs")
  },
  "6d053a7324b3229fd357eb2200d4e929050f07784edd62a37f60c3b2ae052a62": {
    functionName: "recordMedicalIncident_createServerFn_handler",
    importer: () => import("./medical.functions-CpJOl6R6.mjs")
  },
  "15c96a750ac4fc96e36ff3ba32847f33a7fc66ea4a1cae45eacd88282ec379b3": {
    functionName: "listMedicalIncidents_createServerFn_handler",
    importer: () => import("./medical.functions-CpJOl6R6.mjs")
  },
  "39aeff4e2611fc143be73278f5d7e07327dd3155f3b5e4cc2b368e62ef3d1a65": {
    functionName: "recordMedicalAttachment_createServerFn_handler",
    importer: () => import("./medical.functions-CpJOl6R6.mjs")
  },
  "2ce322121f455bee9c2df39a0b6468b8b9ae3910e40315941cb52e8844b4d068": {
    functionName: "listMedicalAttachments_createServerFn_handler",
    importer: () => import("./medical.functions-CpJOl6R6.mjs")
  },
  "aa6bee4a72a6050a03c8671dd36a24013cfcd7e1e9eb43208b73e984800c7339": {
    functionName: "deleteMedicalAttachment_createServerFn_handler",
    importer: () => import("./medical.functions-CpJOl6R6.mjs")
  },
  "f1c1854887716d667c7f2aa6fc5fdcf5a6bccaede801c62fd070b67d2e52f1f7": {
    functionName: "getMedicalAttachmentUrl_createServerFn_handler",
    importer: () => import("./medical.functions-CpJOl6R6.mjs")
  },
  "43476841b09e343dd276a37963532e8f066b8a4b0662fb502e5ca94beced3083": {
    functionName: "listOnboardingTemplates_createServerFn_handler",
    importer: () => import("./templates.functions-BuKLp6oG.mjs")
  },
  "07fc866ca55c9d921e768683213b6647119ac96217fd3c970c7f86ca314436c8": {
    functionName: "upsertOnboardingTemplate_createServerFn_handler",
    importer: () => import("./templates.functions-BuKLp6oG.mjs")
  },
  "2f985f4feb3b68a1053be752b24a15f3223f1fb6a54ad8335bc23dc05b01ce20": {
    functionName: "cloneOnboardingTemplate_createServerFn_handler",
    importer: () => import("./templates.functions-BuKLp6oG.mjs")
  },
  "571217025d5f95336cd59f3356eea3ec2198059cf95eb42b396587273269152d": {
    functionName: "deleteOnboardingTemplate_createServerFn_handler",
    importer: () => import("./templates.functions-BuKLp6oG.mjs")
  },
  "31ddf37462261f054510b38ee34c343fdc2576017662e04343ec1aa89e8db2e2": {
    functionName: "applyOnboardingTemplate_createServerFn_handler",
    importer: () => import("./templates.functions-BuKLp6oG.mjs")
  },
  "a17f72ddba382d56216e5f20e2447dd4ebf93fb49cefacda3c10bdd974145c7a": {
    functionName: "listTrainingBundles_createServerFn_handler",
    importer: () => import("./templates.functions-BuKLp6oG.mjs")
  },
  "cf5157d6328101763891401db7d782cd1742911839b33ad88e4af4d669c04702": {
    functionName: "upsertTrainingBundle_createServerFn_handler",
    importer: () => import("./templates.functions-BuKLp6oG.mjs")
  },
  "dd82ffc05cd1cd39cc51fff53b2415dd039832ab165777c31a4a493734b75a71": {
    functionName: "deleteTrainingBundle_createServerFn_handler",
    importer: () => import("./templates.functions-BuKLp6oG.mjs")
  },
  "7cff8704d8667f91578ae0cc72a6d9dbdb928826e72a6b09d40ea374ea555d54": {
    functionName: "applyTrainingBundle_createServerFn_handler",
    importer: () => import("./templates.functions-BuKLp6oG.mjs")
  },
  "05ac68bc4d1f0200dfbdebe98ef3a0e3e231b07d6adec2e806fc529024dca509": {
    functionName: "listDocumentRequestTemplates_createServerFn_handler",
    importer: () => import("./templates.functions-BuKLp6oG.mjs")
  },
  "ba8611670083a706962b6327949cdee079c2056c2d136615e0d83e186eadfbc6": {
    functionName: "upsertDocumentRequestTemplate_createServerFn_handler",
    importer: () => import("./templates.functions-BuKLp6oG.mjs")
  },
  "5fe07b44e3b68ad946266233247b232799e8f4d337c6cf8594062308b833bf40": {
    functionName: "deleteDocumentRequestTemplate_createServerFn_handler",
    importer: () => import("./templates.functions-BuKLp6oG.mjs")
  },
  "24fc6c6b8acfc652aa8858a86241738f2a7402258cf7942041aa5df7ca8f225a": {
    functionName: "listActiveEmployees_createServerFn_handler",
    importer: () => import("./templates.functions-BuKLp6oG.mjs")
  },
  "08d30269a1696e9feaa7c2cd8da97956b1d175dc2a81d08787afe168963a0f6e": {
    functionName: "suspendAccount_createServerFn_handler",
    importer: () => import("./account-suspension.functions-DxGP96If.mjs")
  },
  "15bb30cc41b89437ba30ffce44df51a6e721dd1be3460699f2a099392fb6a6a8": {
    functionName: "reinstateAccount_createServerFn_handler",
    importer: () => import("./account-suspension.functions-DxGP96If.mjs")
  },
  "02a41e86b044cd0a583f98433a4de0142f648e58059962d01648a75396dacafb": {
    functionName: "listSuspendedAccounts_createServerFn_handler",
    importer: () => import("./account-suspension.functions-DxGP96If.mjs")
  },
  "f6e3cc495382a24f45693bbd680a8a88f57733ba49cb209cfa2148c066e1bdeb": {
    functionName: "getOrgSettings_createServerFn_handler",
    importer: () => import("./org-settings.functions-DFlJUuRV.mjs")
  },
  "90a1561e6353e3126cfb4b356a8417d23a77747b30727d834168c736bc7de765": {
    functionName: "updateOrgSettings_createServerFn_handler",
    importer: () => import("./org-settings.functions-DFlJUuRV.mjs")
  },
  "d0006175a4e9d4f0d33a0a73a987fa1293ea7bc56387c8a8db9488c0d7d5cef5": {
    functionName: "getMfaStatus_createServerFn_handler",
    importer: () => import("./mfa.functions-tD7xZGqD.mjs")
  },
  "ccb3fc392e3f62f117512375633491672440415e51b57e05c58789c916ea85da": {
    functionName: "startEmailMfa_createServerFn_handler",
    importer: () => import("./mfa.functions-tD7xZGqD.mjs")
  },
  "89ef84d1b03da127c5ea648832c30daef92635551353c45f0cf39583ff126f1d": {
    functionName: "verifyEmailMfa_createServerFn_handler",
    importer: () => import("./mfa.functions-tD7xZGqD.mjs")
  },
  "190e8a7bfd793c4778792abe5fd4c30440a216e1f5236671476bc9b341a39dd4": {
    functionName: "setTotpEnrolled_createServerFn_handler",
    importer: () => import("./mfa.functions-tD7xZGqD.mjs")
  },
  "6ac6746bc011d85d88c6f440469af43f023fc03283f38ab42b6883f8e3d283ab": {
    functionName: "getDutyReview_createServerFn_handler",
    importer: () => import("./duty-reviews.functions-wM7e7VnO.mjs")
  },
  "14d92ee5514474b1123f7e4161535f07fdf7a7c0ddc56fae8477a32538c9496c": {
    functionName: "upsertDutyScore_createServerFn_handler",
    importer: () => import("./duty-reviews.functions-wM7e7VnO.mjs")
  },
  "2c0e462bc7a5500b0f8cc3253ddaf54a0a4643a6bce79407baacd9454e46d27f": {
    functionName: "submitMyDutyScore_createServerFn_handler",
    importer: () => import("./duty-reviews.functions-wM7e7VnO.mjs")
  },
  "801f5c6138760a350cb5bf353d34251b37c96dd5a2e52078b4b9ec330ba54424": {
    functionName: "getMyDutyReview_createServerFn_handler",
    importer: () => import("./duty-reviews.functions-wM7e7VnO.mjs")
  },
  "e6cc9ef82b9eb25ac31f360e64a0cfed0513292df3d3051e41c961cf127c0382": {
    functionName: "exportDutyReviewCsv_createServerFn_handler",
    importer: () => import("./duty-reviews.functions-wM7e7VnO.mjs")
  },
  "a68ebd0cc0599862883e972a9c86327558a46b3446b8415e6bf744e4bcfc5438": {
    functionName: "getDutyReviewExportData_createServerFn_handler",
    importer: () => import("./duty-reviews.functions-wM7e7VnO.mjs")
  },
  "c88cb0696bb73914adfaf07580c7f786f843262851f465bf09e03ea6d269c21a": {
    functionName: "listMyDutyReviews_createServerFn_handler",
    importer: () => import("./duty-reviews.functions-wM7e7VnO.mjs")
  },
  "4055460731e572a6d18c252379d717686ebdb67d77577a1d09ac15653646809d": {
    functionName: "listMyQuickAccess_createServerFn_handler",
    importer: () => import("./manager-quick-access.functions-UkQq8Tgz.mjs")
  },
  "f98a0af4d12288c0ff622df077905011b9f7bbcaad50f7c977d68d86e29e0754": {
    functionName: "setMyQuickAccess_createServerFn_handler",
    importer: () => import("./manager-quick-access.functions-UkQq8Tgz.mjs")
  },
  "0695f674cc87cce5761d014138bc84887dbd1729d318abe778472fdc26138faa": {
    functionName: "createPayrollRun_createServerFn_handler",
    importer: () => import("./payroll.functions-DQnqrHZS.mjs")
  },
  "724a156c28afde1cce70dc3678b2fb379502b80e3172de0f85fd5db3b2e5ff6a": {
    functionName: "computePayrollRun_createServerFn_handler",
    importer: () => import("./payroll.functions-DQnqrHZS.mjs")
  },
  "1c9eca8186ec36479ed6d7137a3f445d0d865ad3c94a4694511af97e254d3eae": {
    functionName: "submitPayrollRun_createServerFn_handler",
    importer: () => import("./payroll.functions-DQnqrHZS.mjs")
  },
  "8bca6cc842b4f19936388b19a1be58aa0ebb781cb283f6b7dabe6ee8afcf81aa": {
    functionName: "approvePayrollRun_createServerFn_handler",
    importer: () => import("./payroll.functions-DQnqrHZS.mjs")
  },
  "656ab2abb529d1e67e6a0e45bf4a0f9d47598950e5297c9fca040635138518bc": {
    functionName: "rejectPayrollRun_createServerFn_handler",
    importer: () => import("./payroll.functions-DQnqrHZS.mjs")
  },
  "fd51c7d2190fb1eb7cd9944a4f19b65810dcae84c40092bc3a78fe47663f6b3e": {
    functionName: "cancelPayrollRun_createServerFn_handler",
    importer: () => import("./payroll.functions-DQnqrHZS.mjs")
  },
  "8a9007b2ceb3e654b4c223b4ac2556e38c9cf8236df422720bc4e3332e8d4a60": {
    functionName: "deletePayrollRun_createServerFn_handler",
    importer: () => import("./payroll.functions-DQnqrHZS.mjs")
  },
  "ee9ec807205c1a0834fe032d11c62c917da5a3edbec1643023faf7ae5a716243": {
    functionName: "emailRunPayslips_createServerFn_handler",
    importer: () => import("./payroll-emails.functions-BkeZDrTA.mjs")
  },
  "c4080e9ea788e657df3c1e0002ac4576fb6bab0047b3ee1be02527b84d6c4f46": {
    functionName: "resendPayslipEmail_createServerFn_handler",
    importer: () => import("./payroll-emails.functions-BkeZDrTA.mjs")
  },
  "954fe7ec30e573869760d4bbe3081779223d3a4bcd9ca7c025886bb47daddd4e": {
    functionName: "bulkResendPayslipsInRange_createServerFn_handler",
    importer: () => import("./payroll-emails.functions-BkeZDrTA.mjs")
  },
  "618f951b5bb5c1cef011a9313b3da731ea10c67a54e30fa84df54ef0f84b3f3f": {
    functionName: "getRunVariance_createServerFn_handler",
    importer: () => import("./payroll-insights.functions-BriLmEYV.mjs")
  },
  "ac342f06bed4dcf68429bfe8ea70518cc2ba0b42cde8507ac8384b823b07391a": {
    functionName: "getRunDistribution_createServerFn_handler",
    importer: () => import("./payroll-insights.functions-BriLmEYV.mjs")
  },
  "e8298c3f0194ade51ced9d03ad46e58d333b22abc223b091010cdfa195147a3f": {
    functionName: "previewOnboardingOverdueEmail_createServerFn_handler",
    importer: () => import("./onboarding-email-admin.functions-BrTU_VCN.mjs")
  },
  "6472faeb0eae3c6157e0b651f13f4789fafaab0e752cfd5dbae20545c7796627": {
    functionName: "sendTestOnboardingOverdueEmail_createServerFn_handler",
    importer: () => import("./onboarding-email-admin.functions-BrTU_VCN.mjs")
  },
  "1867c75f8a5cac528310405841a1881e4979037288ccbd593dcd571d8e776800": {
    functionName: "listGeofences_createServerFn_handler",
    importer: () => import("./geofences.functions-ujsXyL5-.mjs")
  },
  "ec7c21b8d0b5ca4021d34e267f6e173c48a459d9bd657c080758d6a615d6b316": {
    functionName: "upsertGeofence_createServerFn_handler",
    importer: () => import("./geofences.functions-ujsXyL5-.mjs")
  },
  "2290ea44c4aa438400b89bd54fb3c682252090cd8b9ef77337220d517ba8f69e": {
    functionName: "deleteGeofence_createServerFn_handler",
    importer: () => import("./geofences.functions-ujsXyL5-.mjs")
  },
  "426ee86312116c89f6763861b849205a4e193492669d6bc435b1796558a89510": {
    functionName: "logGeofenceEvent_createServerFn_handler",
    importer: () => import("./geofence-audit.functions-C3C8VRn1.mjs")
  },
  "66e9738c0be1073e724d7b54d6865773ec183a6e2a186433b93e03f9001da63d": {
    functionName: "listGeofenceAudit_createServerFn_handler",
    importer: () => import("./geofence-audit.functions-C3C8VRn1.mjs")
  },
  "a5520bdb39cb3d25a73160531b129d00475915aedc5ad0ba74f809b1a1268c5d": {
    functionName: "listSimTraces_createServerFn_handler",
    importer: () => import("./geofence-simulation.functions-Bkve0UL3.mjs")
  },
  "9ed7a6d7801653cac0cc7d239febe674c7f1cb1c0828a127d2ccf9b956a4c0ed": {
    functionName: "saveSimTrace_createServerFn_handler",
    importer: () => import("./geofence-simulation.functions-Bkve0UL3.mjs")
  },
  "7cb1346511c3ee2aef56f2be3066d47b7d226c831a9c0e8eebf68f1a081567ac": {
    functionName: "deleteSimTrace_createServerFn_handler",
    importer: () => import("./geofence-simulation.functions-Bkve0UL3.mjs")
  },
  "e4ed6ea3c7a177936390ea01be671b67dfde284c55431c074f3bd3568513ab9c": {
    functionName: "listReconciliation_createServerFn_handler",
    importer: () => import("./geofence-reconciliation.functions-BIGhUTJL.mjs")
  },
  "4b7e5bcbafcd4221892bf5095ae7fc86cbf11611a3f6a190929ffb77b66da2e6": {
    functionName: "resolveReconciliation_createServerFn_handler",
    importer: () => import("./geofence-reconciliation.functions-BIGhUTJL.mjs")
  },
  "d2099c667ea0e2840c941a1603a9d7c0c7cf1046abd9e62126e3fae6c7fb9b7b": {
    functionName: "runReconciliation_createServerFn_handler",
    importer: () => import("./geofence-reconciliation.functions-BIGhUTJL.mjs")
  },
  "c9f805d45d3e154e1e767cf4bdd15bbf7b164d2494a0b25d87c8f051571bee4e": {
    functionName: "listCommsRemoval_createServerFn_handler",
    importer: () => import("./offboarding-comms.functions-CDf3Hg7C.mjs")
  },
  "07fa5ac2761abe5c6217fa395ab0fc1612414652211b10c693020811c07ed840": {
    functionName: "updateCommsRemoval_createServerFn_handler",
    importer: () => import("./offboarding-comms.functions-CDf3Hg7C.mjs")
  },
  "a35eb3b0fbfecb75753e7c3decdeed9b71e4a80bb942421020811ff7112b28fe": {
    functionName: "addCustomCommsChannel_createServerFn_handler",
    importer: () => import("./offboarding-comms.functions-CDf3Hg7C.mjs")
  },
  "429b635747bcebe1d45776ee16e57dfa2c4f582ce221126b041564d93fbe1cab": {
    functionName: "listCommsAudit_createServerFn_handler",
    importer: () => import("./offboarding-comms.functions-CDf3Hg7C.mjs")
  },
  "5275e39443dabbb0dd5530019a8375daceb07d802938a3eccf8c3a49b726313a": {
    functionName: "exportCommsRemovalCsv_createServerFn_handler",
    importer: () => import("./offboarding-comms.functions-CDf3Hg7C.mjs")
  },
  "2ad2ea71ca3de95eac6d4bf941d8c88af99c042fb6606997b9ca7ff117309c90": {
    functionName: "bulkImportEmployees_createServerFn_handler",
    importer: () => import("./employees-bulk.functions-D2wEhukg.mjs")
  },
  "fe7786212f284b2b294f32afa9244aa6e7409f93ff699c0acafe71edf273f0e6": {
    functionName: "listLeaveTypeCodes_createServerFn_handler",
    importer: () => import("./employees-bulk.functions-D2wEhukg.mjs")
  },
  "5409fc3027ce24907be574a7969ee418767984441830ecf7309ae9532dbecf89": {
    functionName: "exportOnboardingAuditCsv_createServerFn_handler",
    importer: () => import("./audit-export.functions-BCF-acp-.mjs")
  },
  "834dedec00b486acfdf6c5f83f7826440c95170f7a99a65803d23334955bcf2e": {
    functionName: "exportVariationAuditCsv_createServerFn_handler",
    importer: () => import("./audit-export.functions-BCF-acp-.mjs")
  },
  "b052719e9ba11dde024d6d9130f4cb530f4a0ce8f5403bf3c485faebe1b074e0": {
    functionName: "previewNepalSeed_createServerFn_handler",
    importer: () => import("./nepal-payroll.functions-D0TgxrvF.mjs")
  },
  "74088d011b9ea2e7447de1196e3efb9d38c89e3da4dc428780947c9e925570f6": {
    functionName: "runNepalPayrollWizard_createServerFn_handler",
    importer: () => import("./nepal-payroll.functions-D0TgxrvF.mjs")
  },
  "f0242e0ea2b4f8b1ea006738b7b917138ce361b75aff7c4234eb747e886bb088": {
    functionName: "globalSearch_createServerFn_handler",
    importer: () => import("./global-search.functions-DSpK0Skj.mjs")
  }
};
async function getServerFnById(id, access) {
  const serverFnInfo = manifest[id];
  if (!serverFnInfo) {
    throw new Error("Server function info not found for " + id);
  }
  const fnModule = serverFnInfo.module ?? await serverFnInfo.importer();
  if (!fnModule) {
    throw new Error("Server function module not resolved for " + id);
  }
  const action = fnModule[serverFnInfo.functionName];
  if (!action) {
    throw new Error("Server function module export not resolved for serverFn ID: " + id);
  }
  return action;
}
var TSS_FORMDATA_CONTEXT = "__TSS_CONTEXT";
var TSS_SERVER_FUNCTION = /* @__PURE__ */ Symbol.for("TSS_SERVER_FUNCTION");
var TSS_SERVER_FUNCTION_FACTORY = /* @__PURE__ */ Symbol.for("TSS_SERVER_FUNCTION_FACTORY");
var X_TSS_SERIALIZED = "x-tss-serialized";
var X_TSS_RAW_RESPONSE = "x-tss-raw";
var TSS_CONTENT_TYPE_FRAMED = "application/x-tss-framed";
var FrameType = {
  JSON: 0,
  CHUNK: 1,
  END: 2,
  ERROR: 3
};
var FRAME_HEADER_SIZE = 9;
var TSS_CONTENT_TYPE_FRAMED_VERSIONED = `${TSS_CONTENT_TYPE_FRAMED}; v=1`;
function isSafeKey(key) {
  return key !== "__proto__" && key !== "constructor" && key !== "prototype";
}
function safeObjectMerge(target, source) {
  const result = /* @__PURE__ */ Object.create(null);
  if (target) {
    for (const key of Object.keys(target)) if (isSafeKey(key)) result[key] = target[key];
  }
  if (source && typeof source === "object") {
    for (const key of Object.keys(source)) if (isSafeKey(key)) result[key] = source[key];
  }
  return result;
}
function createNullProtoObject(source) {
  if (!source) return /* @__PURE__ */ Object.create(null);
  const obj = /* @__PURE__ */ Object.create(null);
  for (const key of Object.keys(source)) if (isSafeKey(key)) obj[key] = source[key];
  return obj;
}
var GLOBAL_STORAGE_KEY = /* @__PURE__ */ Symbol.for("tanstack-start:start-storage-context");
var globalObj = globalThis;
if (!globalObj[GLOBAL_STORAGE_KEY]) globalObj[GLOBAL_STORAGE_KEY] = new AsyncLocalStorage();
var startStorage = globalObj[GLOBAL_STORAGE_KEY];
async function runWithStartContext(context, fn) {
  return startStorage.run(context, fn);
}
function getStartContext(opts) {
  const context = startStorage.getStore();
  if (!context && opts?.throwIfNotFound !== false) throw new Error(`No Start context found in AsyncLocalStorage. Make sure you are using the function within the server runtime.`);
  return context;
}
var getStartOptions = () => getStartContext().startOptions;
var getStartContextServerOnly = getStartContext;
var createServerFn = (options, __opts) => {
  const resolvedOptions = __opts || options || {};
  if (typeof resolvedOptions.method === "undefined") resolvedOptions.method = "GET";
  const res = {
    options: resolvedOptions,
    middleware: (middleware) => {
      const newMiddleware = [...resolvedOptions.middleware || []];
      middleware.map((m) => {
        if (TSS_SERVER_FUNCTION_FACTORY in m) {
          if (m.options.middleware) newMiddleware.push(...m.options.middleware);
        } else newMiddleware.push(m);
      });
      const res2 = createServerFn(void 0, {
        ...resolvedOptions,
        middleware: newMiddleware
      });
      res2[TSS_SERVER_FUNCTION_FACTORY] = true;
      return res2;
    },
    inputValidator: (inputValidator) => {
      return createServerFn(void 0, {
        ...resolvedOptions,
        inputValidator
      });
    },
    handler: (...args) => {
      const [extractedFn, serverFn] = args;
      const newOptions = {
        ...resolvedOptions,
        extractedFn,
        serverFn
      };
      const resolvedMiddleware = [...newOptions.middleware || [], serverFnBaseToMiddleware(newOptions)];
      extractedFn.method = resolvedOptions.method;
      return Object.assign(async (opts) => {
        const result = await executeMiddleware$1(resolvedMiddleware, "client", {
          ...extractedFn,
          ...newOptions,
          data: opts?.data,
          headers: opts?.headers,
          signal: opts?.signal,
          fetch: opts?.fetch,
          context: createNullProtoObject()
        });
        const redirect = parseRedirect(result.error);
        if (redirect) throw redirect;
        if (result.error) throw result.error;
        return result.result;
      }, {
        ...extractedFn,
        method: resolvedOptions.method,
        __executeServer: async (opts) => {
          const startContext = getStartContextServerOnly();
          const serverContextAfterGlobalMiddlewares = startContext.contextAfterGlobalMiddlewares;
          return await executeMiddleware$1(resolvedMiddleware, "server", {
            ...extractedFn,
            ...opts,
            serverFnMeta: extractedFn.serverFnMeta,
            context: safeObjectMerge(opts.context, serverContextAfterGlobalMiddlewares),
            request: startContext.request
          }).then((d) => ({
            result: d.result,
            error: d.error,
            context: d.sendContext
          }));
        }
      });
    }
  };
  const fun = (options2) => {
    return createServerFn(void 0, {
      ...resolvedOptions,
      ...options2
    });
  };
  return Object.assign(fun, res);
};
async function executeMiddleware$1(middlewares, env, opts) {
  let flattenedMiddlewares = flattenMiddlewares([...getStartOptions()?.functionMiddleware || [], ...middlewares]);
  if (env === "server") {
    const startContext = getStartContextServerOnly({ throwIfNotFound: false });
    if (startContext?.executedRequestMiddlewares) flattenedMiddlewares = flattenedMiddlewares.filter((m) => !startContext.executedRequestMiddlewares.has(m));
  }
  const callNextMiddleware = async (ctx) => {
    const nextMiddleware = flattenedMiddlewares.shift();
    if (!nextMiddleware) return ctx;
    try {
      if ("inputValidator" in nextMiddleware.options && nextMiddleware.options.inputValidator && env === "server") ctx.data = await execValidator(nextMiddleware.options.inputValidator, ctx.data);
      let middlewareFn = void 0;
      if (env === "client") {
        if ("client" in nextMiddleware.options) middlewareFn = nextMiddleware.options.client;
      } else if ("server" in nextMiddleware.options) middlewareFn = nextMiddleware.options.server;
      if (middlewareFn) {
        const userNext = async (userCtx = {}) => {
          const result2 = await callNextMiddleware({
            ...ctx,
            ...userCtx,
            context: safeObjectMerge(ctx.context, userCtx.context),
            sendContext: safeObjectMerge(ctx.sendContext, userCtx.sendContext),
            headers: mergeHeaders(ctx.headers, userCtx.headers),
            _callSiteFetch: ctx._callSiteFetch,
            fetch: ctx._callSiteFetch ?? userCtx.fetch ?? ctx.fetch,
            result: userCtx.result !== void 0 ? userCtx.result : userCtx instanceof Response ? userCtx : ctx.result,
            error: userCtx.error ?? ctx.error
          });
          if (result2.error) throw result2.error;
          return result2;
        };
        const result = await middlewareFn({
          ...ctx,
          next: userNext
        });
        if (isRedirect(result)) return {
          ...ctx,
          error: result
        };
        if (result instanceof Response) return {
          ...ctx,
          result
        };
        if (!result) throw new Error("User middleware returned undefined. You must call next() or return a result in your middlewares.");
        return result;
      }
      return callNextMiddleware(ctx);
    } catch (error) {
      return {
        ...ctx,
        error
      };
    }
  };
  return callNextMiddleware({
    ...opts,
    headers: opts.headers || {},
    sendContext: opts.sendContext || {},
    context: opts.context || createNullProtoObject(),
    _callSiteFetch: opts.fetch
  });
}
function flattenMiddlewares(middlewares, maxDepth = 100) {
  const seen = /* @__PURE__ */ new Set();
  const flattened = [];
  const recurse = (middleware, depth) => {
    if (depth > maxDepth) throw new Error(`Middleware nesting depth exceeded maximum of ${maxDepth}. Check for circular references.`);
    middleware.forEach((m) => {
      if (m.options.middleware) recurse(m.options.middleware, depth + 1);
      if (!seen.has(m)) {
        seen.add(m);
        flattened.push(m);
      }
    });
  };
  recurse(middlewares, 0);
  return flattened;
}
async function execValidator(validator, input) {
  if (validator == null) return {};
  if ("~standard" in validator) {
    const result = await validator["~standard"].validate(input);
    if (result.issues) throw new Error(JSON.stringify(result.issues, void 0, 2));
    return result.value;
  }
  if ("parse" in validator) return validator.parse(input);
  if (typeof validator === "function") return validator(input);
  throw new Error("Invalid validator type!");
}
function serverFnBaseToMiddleware(options) {
  return {
    "~types": void 0,
    options: {
      inputValidator: options.inputValidator,
      client: async ({ next, sendContext, fetch: fetch2, ...ctx }) => {
        const payload = {
          ...ctx,
          context: sendContext,
          fetch: fetch2
        };
        return next(await options.extractedFn?.(payload));
      },
      server: async ({ next, ...ctx }) => {
        const result = await options.serverFn?.(ctx);
        return next({
          ...ctx,
          result
        });
      }
    }
  };
}
function getDefaultSerovalPlugins() {
  return [...getStartOptions()?.serializationAdapters?.map(makeSerovalPlugin) ?? [], ...defaultSerovalPlugins];
}
var textEncoder = new TextEncoder();
var EMPTY_PAYLOAD = new Uint8Array(0);
function encodeFrame(type, streamId, payload) {
  const frame = new Uint8Array(FRAME_HEADER_SIZE + payload.length);
  frame[0] = type;
  frame[1] = streamId >>> 24 & 255;
  frame[2] = streamId >>> 16 & 255;
  frame[3] = streamId >>> 8 & 255;
  frame[4] = streamId & 255;
  frame[5] = payload.length >>> 24 & 255;
  frame[6] = payload.length >>> 16 & 255;
  frame[7] = payload.length >>> 8 & 255;
  frame[8] = payload.length & 255;
  frame.set(payload, FRAME_HEADER_SIZE);
  return frame;
}
function encodeJSONFrame(json) {
  return encodeFrame(FrameType.JSON, 0, textEncoder.encode(json));
}
function encodeChunkFrame(streamId, chunk) {
  return encodeFrame(FrameType.CHUNK, streamId, chunk);
}
function encodeEndFrame(streamId) {
  return encodeFrame(FrameType.END, streamId, EMPTY_PAYLOAD);
}
function encodeErrorFrame(streamId, error) {
  const message = error instanceof Error ? error.message : String(error ?? "Unknown error");
  return encodeFrame(FrameType.ERROR, streamId, textEncoder.encode(message));
}
function createMultiplexedStream(jsonStream, rawStreams, lateStreamSource) {
  let controller;
  let cancelled = false;
  const readers = [];
  const enqueue = (frame) => {
    if (cancelled) return false;
    try {
      controller.enqueue(frame);
      return true;
    } catch {
      return false;
    }
  };
  const errorOutput = (error) => {
    if (cancelled) return;
    cancelled = true;
    try {
      controller.error(error);
    } catch {
    }
    for (const reader of readers) reader.cancel().catch(() => {
    });
  };
  async function pumpRawStream(streamId, stream) {
    const reader = stream.getReader();
    readers.push(reader);
    try {
      while (!cancelled) {
        const { done, value } = await reader.read();
        if (done) {
          enqueue(encodeEndFrame(streamId));
          return;
        }
        if (!enqueue(encodeChunkFrame(streamId, value))) return;
      }
    } catch (error) {
      enqueue(encodeErrorFrame(streamId, error));
    } finally {
      reader.releaseLock();
    }
  }
  async function pumpJSON() {
    const reader = jsonStream.getReader();
    readers.push(reader);
    try {
      while (!cancelled) {
        const { done, value } = await reader.read();
        if (done) return;
        if (!enqueue(encodeJSONFrame(value))) return;
      }
    } catch (error) {
      errorOutput(error);
      throw error;
    } finally {
      reader.releaseLock();
    }
  }
  async function pumpLateStreams() {
    if (!lateStreamSource) return [];
    const lateStreamPumps = [];
    const reader = lateStreamSource.getReader();
    readers.push(reader);
    try {
      while (!cancelled) {
        const { done, value } = await reader.read();
        if (done) break;
        lateStreamPumps.push(pumpRawStream(value.id, value.stream));
      }
    } finally {
      reader.releaseLock();
    }
    return lateStreamPumps;
  }
  return new ReadableStream({
    async start(ctrl) {
      controller = ctrl;
      const pumps = [pumpJSON()];
      for (const [streamId, stream] of rawStreams) pumps.push(pumpRawStream(streamId, stream));
      if (lateStreamSource) pumps.push(pumpLateStreams());
      try {
        const latePumps = (await Promise.all(pumps)).find(Array.isArray);
        if (latePumps && latePumps.length > 0) await Promise.all(latePumps);
        if (!cancelled) try {
          controller.close();
        } catch {
        }
      } catch {
      }
    },
    cancel() {
      cancelled = true;
      for (const reader of readers) reader.cancel().catch(() => {
      });
      readers.length = 0;
    }
  });
}
var serovalPlugins = void 0;
var FORM_DATA_CONTENT_TYPES = ["multipart/form-data", "application/x-www-form-urlencoded"];
var MAX_PAYLOAD_SIZE = 1e6;
var handleServerAction = async ({ request, context, serverFnId }) => {
  const methodUpper = request.method.toUpperCase();
  const url = new URL(request.url);
  const action = await getServerFnById(serverFnId);
  if (action.method && methodUpper !== action.method) return new Response(`expected ${action.method} method. Got ${methodUpper}`, {
    status: 405,
    headers: { Allow: action.method }
  });
  const isServerFn = request.headers.get("x-tsr-serverFn") === "true";
  if (!serovalPlugins) serovalPlugins = getDefaultSerovalPlugins();
  const contentType = request.headers.get("Content-Type");
  function parsePayload(payload) {
    return Iu(payload, { plugins: serovalPlugins });
  }
  return await (async () => {
    try {
      let serializeResult = function(res2) {
        let nonStreamingBody = void 0;
        const alsResponse = getResponse();
        if (res2 !== void 0) {
          const rawStreams = /* @__PURE__ */ new Map();
          let initialPhase = true;
          let lateStreamWriter;
          let lateStreamReadable = void 0;
          const pendingLateStreams = [];
          const plugins = [createRawStreamRPCPlugin((id, stream) => {
            if (initialPhase) {
              rawStreams.set(id, stream);
              return;
            }
            if (lateStreamWriter) {
              lateStreamWriter.write({
                id,
                stream
              }).catch(() => {
              });
              return;
            }
            pendingLateStreams.push({
              id,
              stream
            });
          }), ...serovalPlugins || []];
          let done = false;
          const callbacks = {
            onParse: (value) => {
              nonStreamingBody = value;
            },
            onDone: () => {
              done = true;
            },
            onError: (error) => {
              throw error;
            }
          };
          au(res2, {
            refs: /* @__PURE__ */ new Map(),
            plugins,
            onParse(value) {
              callbacks.onParse(value);
            },
            onDone() {
              callbacks.onDone();
            },
            onError: (error) => {
              callbacks.onError(error);
            }
          });
          initialPhase = false;
          if (done && rawStreams.size === 0) return new Response(nonStreamingBody ? JSON.stringify(nonStreamingBody) : void 0, {
            status: alsResponse.status,
            statusText: alsResponse.statusText,
            headers: {
              "Content-Type": "application/json",
              [X_TSS_SERIALIZED]: "true"
            }
          });
          const { readable, writable } = new TransformStream();
          lateStreamReadable = readable;
          lateStreamWriter = writable.getWriter();
          for (const registration of pendingLateStreams) lateStreamWriter.write(registration).catch(() => {
          });
          pendingLateStreams.length = 0;
          const multiplexedStream = createMultiplexedStream(new ReadableStream({
            start(controller) {
              callbacks.onParse = (value) => {
                controller.enqueue(JSON.stringify(value) + "\n");
              };
              callbacks.onDone = () => {
                try {
                  controller.close();
                } catch {
                }
                lateStreamWriter?.close().catch(() => {
                }).finally(() => {
                  lateStreamWriter = void 0;
                });
              };
              callbacks.onError = (error) => {
                controller.error(error);
                lateStreamWriter?.abort(error).catch(() => {
                }).finally(() => {
                  lateStreamWriter = void 0;
                });
              };
              if (nonStreamingBody !== void 0) callbacks.onParse(nonStreamingBody);
              if (done) callbacks.onDone();
            },
            cancel() {
              lateStreamWriter?.abort().catch(() => {
              });
              lateStreamWriter = void 0;
            }
          }), rawStreams, lateStreamReadable);
          return new Response(multiplexedStream, {
            status: alsResponse.status,
            statusText: alsResponse.statusText,
            headers: {
              "Content-Type": TSS_CONTENT_TYPE_FRAMED_VERSIONED,
              [X_TSS_SERIALIZED]: "true"
            }
          });
        }
        return new Response(void 0, {
          status: alsResponse.status,
          statusText: alsResponse.statusText
        });
      };
      let res = await (async () => {
        if (FORM_DATA_CONTENT_TYPES.some((type) => contentType && contentType.includes(type))) {
          if (methodUpper === "GET") {
            if (false) ;
            invariant();
          }
          const formData = await request.formData();
          const serializedContext = formData.get(TSS_FORMDATA_CONTEXT);
          formData.delete(TSS_FORMDATA_CONTEXT);
          const params = {
            context,
            data: formData,
            method: methodUpper
          };
          if (typeof serializedContext === "string") try {
            const deserializedContext = Iu(JSON.parse(serializedContext), { plugins: serovalPlugins });
            if (typeof deserializedContext === "object" && deserializedContext) params.context = safeObjectMerge(deserializedContext, context);
          } catch (e) {
            if (false) ;
          }
          return await action(params);
        }
        if (methodUpper === "GET") {
          const payloadParam = url.searchParams.get("payload");
          if (payloadParam && payloadParam.length > MAX_PAYLOAD_SIZE) throw new Error("Payload too large");
          const payload2 = payloadParam ? parsePayload(JSON.parse(payloadParam)) : {};
          payload2.context = safeObjectMerge(payload2.context, context);
          payload2.method = methodUpper;
          return await action(payload2);
        }
        let jsonPayload;
        if (contentType?.includes("application/json")) jsonPayload = await request.json();
        const payload = jsonPayload ? parsePayload(jsonPayload) : {};
        payload.context = safeObjectMerge(payload.context, context);
        payload.method = methodUpper;
        return await action(payload);
      })();
      const unwrapped = res.result || res.error;
      if (isNotFound(res)) res = isNotFoundResponse(res);
      if (!isServerFn) return unwrapped;
      if (unwrapped instanceof Response) {
        if (isRedirect(unwrapped)) return unwrapped;
        unwrapped.headers.set(X_TSS_RAW_RESPONSE, "true");
        return unwrapped;
      }
      return serializeResult(res);
    } catch (error) {
      if (error instanceof Response) return error;
      if (isNotFound(error)) return isNotFoundResponse(error);
      console.info();
      console.info("Server Fn Error!");
      console.info();
      console.error(error);
      console.info();
      const serializedError = JSON.stringify(await Promise.resolve(ou(error, {
        refs: /* @__PURE__ */ new Map(),
        plugins: serovalPlugins
      })));
      const response = getResponse();
      return new Response(serializedError, {
        status: response.status ?? 500,
        statusText: response.statusText,
        headers: {
          "Content-Type": "application/json",
          [X_TSS_SERIALIZED]: "true"
        }
      });
    }
  })();
};
function isNotFoundResponse(error) {
  const { headers, ...rest } = error;
  return new Response(JSON.stringify(rest), {
    status: 404,
    headers: {
      "Content-Type": "application/json",
      ...headers || {}
    }
  });
}
function normalizeTransformAssetResult(result) {
  if (typeof result === "string") return { href: result };
  return result;
}
function resolveTransformAssetsCrossOrigin(config, kind) {
  if (!config) return void 0;
  if (typeof config === "string") return config;
  return config[kind];
}
function isObjectShorthand(transform) {
  return "prefix" in transform;
}
function resolveTransformAssetsConfig(transform) {
  if (typeof transform === "string") {
    const prefix = transform;
    return {
      type: "transform",
      transformFn: ({ url }) => ({ href: `${prefix}${url}` }),
      cache: true
    };
  }
  if (typeof transform === "function") return {
    type: "transform",
    transformFn: transform,
    cache: true
  };
  if (isObjectShorthand(transform)) {
    const { prefix, crossOrigin } = transform;
    return {
      type: "transform",
      transformFn: ({ url, kind }) => {
        const href = `${prefix}${url}`;
        if (kind === "clientEntry") return { href };
        const co = resolveTransformAssetsCrossOrigin(crossOrigin, kind);
        return co ? {
          href,
          crossOrigin: co
        } : { href };
      },
      cache: true
    };
  }
  if ("createTransform" in transform && transform.createTransform) return {
    type: "createTransform",
    createTransform: transform.createTransform,
    cache: transform.cache !== false
  };
  return {
    type: "transform",
    transformFn: typeof transform.transform === "string" ? (({ url }) => ({ href: `${transform.transform}${url}` })) : transform.transform,
    cache: transform.cache !== false
  };
}
function adaptTransformAssetUrlsToTransformAssets(transformFn) {
  return async ({ url, kind }) => ({ href: await transformFn({
    url,
    type: kind
  }) });
}
function adaptTransformAssetUrlsConfigToTransformAssets(transform) {
  if (typeof transform === "string") return transform;
  if (typeof transform === "function") return adaptTransformAssetUrlsToTransformAssets(transform);
  if ("createTransform" in transform && transform.createTransform) return {
    createTransform: async (ctx) => adaptTransformAssetUrlsToTransformAssets(await transform.createTransform(ctx)),
    cache: transform.cache,
    warmup: transform.warmup
  };
  return {
    transform: typeof transform.transform === "string" ? transform.transform : adaptTransformAssetUrlsToTransformAssets(transform.transform),
    cache: transform.cache,
    warmup: transform.warmup
  };
}
function buildClientEntryScriptTag(clientEntry, injectedHeadScripts) {
  let script = `import(${JSON.stringify(clientEntry)})`;
  if (injectedHeadScripts) script = `${injectedHeadScripts};${script}`;
  return {
    tag: "script",
    attrs: {
      type: "module",
      async: true
    },
    children: script
  };
}
function assignManifestAssetLink(link, next) {
  if (typeof link === "string") return next.crossOrigin ? next : next.href;
  return next.crossOrigin ? next : { href: next.href };
}
async function transformManifestAssets(source, transformFn, _opts) {
  const manifest2 = structuredClone(source.manifest);
  for (const route of Object.values(manifest2.routes)) {
    if (route.preloads) route.preloads = await Promise.all(route.preloads.map(async (link) => {
      const result = normalizeTransformAssetResult(await transformFn({
        url: resolveManifestAssetLink(link).href,
        kind: "modulepreload"
      }));
      return assignManifestAssetLink(link, {
        href: result.href,
        crossOrigin: result.crossOrigin
      });
    }));
    if (route.assets && !source.manifest.inlineCss) {
      for (const asset of route.assets) if (asset.tag === "link" && asset.attrs?.href) {
        const rel = asset.attrs.rel;
        if (!(typeof rel === "string" ? rel.split(/\s+/) : []).includes("stylesheet")) continue;
        const result = normalizeTransformAssetResult(await transformFn({
          url: asset.attrs.href,
          kind: "stylesheet"
        }));
        asset.attrs.href = result.href;
        if (result.crossOrigin) asset.attrs.crossOrigin = result.crossOrigin;
        else delete asset.attrs.crossOrigin;
      }
    }
  }
  const transformedClientEntry = normalizeTransformAssetResult(await transformFn({
    url: source.clientEntry,
    kind: "clientEntry"
  }));
  const rootRoute = manifest2.routes[rootRouteId] = manifest2.routes[rootRouteId] || {};
  rootRoute.assets = rootRoute.assets || [];
  rootRoute.assets.push(buildClientEntryScriptTag(transformedClientEntry.href, source.injectedHeadScripts));
  return manifest2;
}
function buildManifestWithClientEntry(source) {
  const scriptTag = buildClientEntryScriptTag(source.clientEntry, source.injectedHeadScripts);
  const baseRootRoute = source.manifest.routes[rootRouteId];
  const routes = {
    ...source.manifest.routes,
    [rootRouteId]: {
      ...baseRootRoute,
      assets: [...baseRootRoute?.assets || [], scriptTag]
    }
  };
  return {
    inlineCss: source.manifest.inlineCss,
    routes
  };
}
var ServerFunctionSerializationAdapter = createSerializationAdapter({
  key: "$TSS/serverfn",
  test: (v) => {
    if (typeof v !== "function") return false;
    if (!(TSS_SERVER_FUNCTION in v)) return false;
    return !!v[TSS_SERVER_FUNCTION];
  },
  toSerializable: ({ serverFnMeta }) => ({ functionId: serverFnMeta.id }),
  fromSerializable: ({ functionId }) => {
    const fn = async (opts, signal) => {
      return (await (await getServerFnById(functionId))(opts ?? {}, signal)).result;
    };
    return fn;
  }
});
function getStartResponseHeaders(opts) {
  return mergeHeaders({ "Content-Type": "text/html; charset=utf-8" }, ...opts.router.stores.matches.get().map((match) => {
    return match.headers;
  }));
}
var entriesPromise;
var baseManifestPromise;
var cachedFinalManifestPromise;
async function loadEntries() {
  const [routerEntry, startEntry, pluginAdapters] = await Promise.all([
    import("./router-CLxirH5A.mjs").then((n) => n.be),
    import("./start-DjXFK_hX.mjs"),
    import("../__23tanstack-start-plugin-adapters-Cwee5PKy.mjs")
  ]);
  return {
    routerEntry,
    startEntry,
    pluginAdapters
  };
}
function getEntries() {
  if (!entriesPromise) entriesPromise = loadEntries();
  return entriesPromise;
}
function getBaseManifest(matchedRoutes) {
  if (!baseManifestPromise) baseManifestPromise = getStartManifest();
  return baseManifestPromise;
}
async function resolveManifest(matchedRoutes, transformFn, cache) {
  const base = await getBaseManifest();
  const computeFinalManifest = async () => {
    return transformFn ? await transformManifestAssets(base, transformFn) : buildManifestWithClientEntry(base);
  };
  if (!transformFn || cache) {
    if (!cachedFinalManifestPromise) cachedFinalManifestPromise = computeFinalManifest();
    return cachedFinalManifestPromise;
  }
  return computeFinalManifest();
}
var ROUTER_BASEPATH = "/";
var SERVER_FN_BASE = "/_serverFn/";
var IS_PRERENDERING = process.env.TSS_PRERENDERING === "true";
var IS_SHELL_ENV = process.env.TSS_SHELL === "true";
var ERR_NO_RESPONSE = "Internal Server Error";
var ERR_NO_DEFER = "Internal Server Error";
function throwRouteHandlerError() {
  throw new Error(ERR_NO_RESPONSE);
}
function throwIfMayNotDefer() {
  throw new Error(ERR_NO_DEFER);
}
function isSpecialResponse(value) {
  return value instanceof Response || isRedirect(value);
}
function handleCtxResult(result) {
  if (isSpecialResponse(result)) return { response: result };
  return result;
}
function executeMiddleware(middlewares, ctx) {
  let index = -1;
  const next = async (nextCtx) => {
    if (nextCtx) {
      if (nextCtx.context) ctx.context = safeObjectMerge(ctx.context, nextCtx.context);
      for (const key of Object.keys(nextCtx)) if (key !== "context") ctx[key] = nextCtx[key];
    }
    index++;
    const middleware = middlewares[index];
    if (!middleware) return ctx;
    let result;
    try {
      result = await middleware({
        ...ctx,
        next
      });
    } catch (err) {
      if (isSpecialResponse(err)) {
        ctx.response = err;
        return ctx;
      }
      throw err;
    }
    const normalized = handleCtxResult(result);
    if (normalized) {
      if (normalized.response !== void 0) ctx.response = normalized.response;
      if (normalized.context) ctx.context = safeObjectMerge(ctx.context, normalized.context);
    }
    return ctx;
  };
  return next();
}
function handlerToMiddleware(handler, mayDefer = false) {
  if (mayDefer) return handler;
  return async (ctx) => {
    const response = await handler({
      ...ctx,
      next: throwIfMayNotDefer
    });
    if (!response) throwRouteHandlerError();
    return response;
  };
}
function createStartHandler(cbOrOptions) {
  const cb = typeof cbOrOptions === "function" ? cbOrOptions : cbOrOptions.handler;
  const transformAssetsOption = typeof cbOrOptions === "function" ? void 0 : cbOrOptions.transformAssets;
  const transformAssetUrlsOption = typeof cbOrOptions === "function" ? void 0 : cbOrOptions.transformAssetUrls;
  const transformOption = transformAssetsOption !== void 0 ? resolveTransformAssetsConfig(transformAssetsOption) : transformAssetUrlsOption !== void 0 ? resolveTransformAssetsConfig(adaptTransformAssetUrlsConfigToTransformAssets(transformAssetUrlsOption)) : void 0;
  const warmupTransformManifest = !!transformAssetsOption && typeof transformAssetsOption === "object" && "warmup" in transformAssetsOption && transformAssetsOption.warmup === true || !!transformAssetUrlsOption && typeof transformAssetUrlsOption === "object" && transformAssetUrlsOption.warmup === true;
  const resolvedTransformConfig = transformOption;
  const cache = resolvedTransformConfig ? resolvedTransformConfig.cache : true;
  const shouldCacheCreateTransform = cache && true;
  let cachedCreateTransformPromise;
  const getTransformFn = async (opts) => {
    if (!resolvedTransformConfig) return void 0;
    if (resolvedTransformConfig.type === "createTransform") {
      if (shouldCacheCreateTransform) {
        if (!cachedCreateTransformPromise) cachedCreateTransformPromise = Promise.resolve(resolvedTransformConfig.createTransform(opts)).catch((error) => {
          cachedCreateTransformPromise = void 0;
          throw error;
        });
        return cachedCreateTransformPromise;
      }
      return resolvedTransformConfig.createTransform(opts);
    }
    return resolvedTransformConfig.transformFn;
  };
  if (warmupTransformManifest && cache && true && !cachedFinalManifestPromise) {
    const warmupPromise = (async () => {
      const base = await getBaseManifest();
      const transformFn = await getTransformFn({ warmup: true });
      return transformFn ? await transformManifestAssets(base, transformFn) : buildManifestWithClientEntry(base);
    })();
    cachedFinalManifestPromise = warmupPromise;
    warmupPromise.catch(() => {
      if (cachedFinalManifestPromise === warmupPromise) cachedFinalManifestPromise = void 0;
      cachedCreateTransformPromise = void 0;
    });
  }
  const startRequestResolver = async (request, requestOpts) => {
    let router = null;
    let cbWillCleanup = false;
    try {
      const { url, handledProtocolRelativeURL } = getNormalizedURL(request.url);
      const href = url.pathname + url.search + url.hash;
      const origin = getOrigin(request);
      if (handledProtocolRelativeURL) return Response.redirect(url, 308);
      const entries = await getEntries();
      const startOptions = await entries.startEntry.startInstance?.getOptions() || {};
      const { hasPluginAdapters, pluginSerializationAdapters } = entries.pluginAdapters;
      const serializationAdapters = [
        ...startOptions.serializationAdapters || [],
        ...hasPluginAdapters ? pluginSerializationAdapters : [],
        ServerFunctionSerializationAdapter
      ];
      const requestStartOptions = {
        ...startOptions,
        serializationAdapters
      };
      const flattenedRequestMiddlewares = startOptions.requestMiddleware ? flattenMiddlewares(startOptions.requestMiddleware) : [];
      const executedRequestMiddlewares = new Set(flattenedRequestMiddlewares);
      const getRouter = async () => {
        if (router) return router;
        router = await entries.routerEntry.getRouter();
        let isShell = IS_SHELL_ENV;
        if (IS_PRERENDERING && !isShell) isShell = request.headers.get(HEADERS.TSS_SHELL) === "true";
        const history = createMemoryHistory({ initialEntries: [href] });
        router.update({
          history,
          isShell,
          isPrerendering: IS_PRERENDERING,
          origin: router.options.origin ?? origin,
          defaultSsr: requestStartOptions.defaultSsr,
          serializationAdapters: [...requestStartOptions.serializationAdapters, ...router.options.serializationAdapters || []],
          basepath: ROUTER_BASEPATH
        });
        return router;
      };
      if (SERVER_FN_BASE && url.pathname.startsWith(SERVER_FN_BASE)) {
        const serverFnId = url.pathname.slice(SERVER_FN_BASE.length).split("/")[0];
        if (!serverFnId) throw new Error("Invalid server action param for serverFnId");
        const serverFnHandler = async ({ context }) => {
          return runWithStartContext({
            getRouter,
            startOptions: requestStartOptions,
            contextAfterGlobalMiddlewares: context,
            request,
            executedRequestMiddlewares,
            handlerType: "serverFn"
          }, () => handleServerAction({
            request,
            context: requestOpts?.context,
            serverFnId
          }));
        };
        return handleRedirectResponse((await executeMiddleware([...flattenedRequestMiddlewares.map((d) => d.options.server), serverFnHandler], {
          request,
          pathname: url.pathname,
          context: createNullProtoObject(requestOpts?.context)
        })).response, request, getRouter);
      }
      const executeRouter = async (serverContext, matchedRoutes) => {
        const acceptParts = (request.headers.get("Accept") || "*/*").split(",");
        if (!["*/*", "text/html"].some((mimeType) => acceptParts.some((part) => part.trim().startsWith(mimeType)))) return Response.json({ error: "Only HTML requests are supported here" }, { status: 500 });
        const manifest2 = await resolveManifest(matchedRoutes, await getTransformFn({
          warmup: false,
          request
        }), cache);
        const routerInstance = await getRouter();
        attachRouterServerSsrUtils({
          router: routerInstance,
          manifest: manifest2,
          getRequestAssets: () => getStartContext({ throwIfNotFound: false })?.requestAssets,
          includeUnmatchedRouteAssets: false
        });
        routerInstance.update({ additionalContext: { serverContext } });
        await routerInstance.load();
        if (routerInstance.state.redirect) return routerInstance.state.redirect;
        const ctx = getStartContext({ throwIfNotFound: false });
        await routerInstance.serverSsr.dehydrate({ requestAssets: ctx?.requestAssets });
        const responseHeaders = getStartResponseHeaders({ router: routerInstance });
        cbWillCleanup = true;
        return cb({
          request,
          router: routerInstance,
          responseHeaders
        });
      };
      const requestHandlerMiddleware = async ({ context }) => {
        return runWithStartContext({
          getRouter,
          startOptions: requestStartOptions,
          contextAfterGlobalMiddlewares: context,
          request,
          executedRequestMiddlewares,
          handlerType: "router"
        }, async () => {
          try {
            return await handleServerRoutes({
              getRouter,
              request,
              url,
              executeRouter,
              context,
              executedRequestMiddlewares
            });
          } catch (err) {
            if (err instanceof Response) return err;
            throw err;
          }
        });
      };
      return handleRedirectResponse((await executeMiddleware([...flattenedRequestMiddlewares.map((d) => d.options.server), requestHandlerMiddleware], {
        request,
        pathname: url.pathname,
        context: createNullProtoObject(requestOpts?.context)
      })).response, request, getRouter);
    } finally {
      if (router && !cbWillCleanup) router.serverSsr?.cleanup();
      router = null;
    }
  };
  return requestHandler(startRequestResolver);
}
async function handleRedirectResponse(response, request, getRouter) {
  if (!isRedirect(response)) return response;
  if (isResolvedRedirect(response)) {
    if (request.headers.get("x-tsr-serverFn") === "true") return Response.json({
      ...response.options,
      isSerializedRedirect: true
    }, { headers: response.headers });
    return response;
  }
  const opts = response.options;
  if (opts.to && typeof opts.to === "string" && !opts.to.startsWith("/")) throw new Error(`Server side redirects must use absolute paths via the 'href' or 'to' options. The redirect() method's "to" property accepts an internal path only. Use the "href" property to provide an external URL. Received: ${JSON.stringify(opts)}`);
  if ([
    "params",
    "search",
    "hash"
  ].some((d) => typeof opts[d] === "function")) throw new Error(`Server side redirects must use static search, params, and hash values and do not support functional values. Received functional values for: ${Object.keys(opts).filter((d) => typeof opts[d] === "function").map((d) => `"${d}"`).join(", ")}`);
  const redirect = (await getRouter()).resolveRedirect(response);
  if (request.headers.get("x-tsr-serverFn") === "true") return Response.json({
    ...response.options,
    isSerializedRedirect: true
  }, { headers: response.headers });
  return redirect;
}
async function handleServerRoutes({ getRouter, request, url, executeRouter, context, executedRequestMiddlewares }) {
  const router = await getRouter();
  const pathname = executeRewriteInput(router.rewrite, url).pathname;
  const { matchedRoutes, foundRoute, routeParams } = router.getMatchedRoutes(pathname);
  const isExactMatch = foundRoute && routeParams["**"] === void 0;
  const routeMiddlewares = [];
  for (const route of matchedRoutes) {
    const serverMiddleware = route.options.server?.middleware;
    if (serverMiddleware) {
      const flattened = flattenMiddlewares(serverMiddleware);
      for (const m of flattened) if (!executedRequestMiddlewares.has(m)) routeMiddlewares.push(m.options.server);
    }
  }
  const server2 = foundRoute?.options.server;
  if (server2?.handlers && isExactMatch) {
    const handlers = typeof server2.handlers === "function" ? server2.handlers({ createHandlers: (d) => d }) : server2.handlers;
    const handler = handlers[request.method.toUpperCase()] ?? handlers["ANY"];
    if (handler) {
      const mayDefer = !!foundRoute.options.component;
      if (typeof handler === "function") routeMiddlewares.push(handlerToMiddleware(handler, mayDefer));
      else {
        if (handler.middleware?.length) {
          const handlerMiddlewares = flattenMiddlewares(handler.middleware);
          for (const m of handlerMiddlewares) routeMiddlewares.push(m.options.server);
        }
        if (handler.handler) routeMiddlewares.push(handlerToMiddleware(handler.handler, mayDefer));
      }
    }
  }
  routeMiddlewares.push((ctx) => executeRouter(ctx.context, matchedRoutes));
  return (await executeMiddleware(routeMiddlewares, {
    request,
    context,
    params: routeParams,
    pathname
  })).response;
}
var fetch = createStartHandler(defaultStreamHandler);
function createServerEntry(entry) {
  return { async fetch(...args) {
    return await entry.fetch(...args);
  } };
}
var server_default = createServerEntry({ fetch });
const server = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  createServerEntry,
  default: server_default
}, Symbol.toStringTag, { value: "Module" }));
export {
  TSS_SERVER_FUNCTION as T,
  getRequest as a,
  getRequestHost$1 as b,
  createServerFn as c,
  getRequestIP$1 as d,
  getRequestHeader as e,
  getServerFnById as g,
  server as s
};
