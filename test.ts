/*
 * Copyright (c) 2022. Deutsche Telekom AG
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
(window as any).global = window;

/*
 * leaflet-wms-header requests map tiles as soon as a map component is constructed, and a
 * headless unit-test run has no backend to answer them (see leaflet.service.ts
 * `getWMSLayer`, which points at `${backendServerUrl}/maps`).
 *
 * Scoped deliberately to those tile requests rather than replacing fetch outright: a
 * blanket always-200 stub also swallows every other call — including the SSE streams in
 * helpers.ts `fromEventSource` — so a spec that unintentionally reaches the network would
 * silently receive a fake empty 200 instead of failing. Anything unexpected rejects with
 * its URL; stub it in the spec (HttpTestingController or a jasmine spy) instead of
 * widening this.
 */
const originalFetch = window.fetch.bind(window);
const karmaInfrastructure = /^\/(base|absolute|__karma__|socket\.io)\//;
(window as any).fetch = (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  const url =
    typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.href
        : input.url;

  if (url.includes('/maps')) {
    return Promise.resolve(new Response(null, { status: 200 }));
  }

  // Karma serves the spec bundle and its assets over fetch; let those through untouched.
  if (karmaInfrastructure.test(new URL(url, window.location.origin).pathname)) {
    return originalFetch(input as RequestInfo, init);
  }

  return Promise.reject(
    new Error(
      `Unexpected network fetch in a unit test: ${url}\n` +
        'Stub it in the spec rather than widening the global fetch override in src/test.ts.'
    )
  );
};

window.onbeforeunload = () => {};
// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);
