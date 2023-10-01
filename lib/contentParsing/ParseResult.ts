// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import TextContainerDepthGroup from "./TextContainerDepthGroup.ts";
import TraversalPathSearchResult from "./TraversalPathSearchResult.ts";
import TextContainer from "./TextContainer.ts";
import ImageContainer from "./ImageContainer.ts";
import { Element } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

export default interface ParseResult {
  contentSearchRootElement: Element;
  depthGroupWithMostWords: TextContainerDepthGroup;
  primaryTextContainerSearchResults: TraversalPathSearchResult[];
  additionalPrimaryTextContainers: TextContainer[];
  primaryTextRootNode: Element;
  primaryTextContainers: TextContainer[];
  imageContainers: ImageContainer[];
  preformattedTextContainers: TextContainer[];
}
