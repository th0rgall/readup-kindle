// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

export function formatCurrency(amount: number) {
  return (amount / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "usd",
  });
}
export function formatIsoDateAsDotNet(isoDate: string) {
  return isoDate.replace(/z$/i, "");
}
export function formatIsoDateAsUtc(isoDate: string) {
  return isoDate.endsWith("Z") ? isoDate : isoDate + "Z";
}
export function formatList<T>(list: T[]) {
  if (!list || list.length === 0) {
    return "";
  }
  if (list.length === 1) {
    return list[0];
  }
  return `${list.slice(0, list.length - 1).join(", ")} & ${
    list[list.length - 1]
  }`;
}
export function formatTimestamp(timestamp: string) {
  if (!timestamp || timestamp.length < 10) {
    return timestamp;
  }
  return (
    parseInt(timestamp.substr(5, 2)) +
    "/" +
    parseInt(timestamp.substr(8, 2)) +
    "/" +
    timestamp.substr(2, 2)
  );
}
export function truncateText(text: string, length: number) {
  if (!text) {
    return text;
  }
  return text.length > length ? text.substring(0, length - 1) + "…" : text;
}
export function formatPossessive(text: string) {
  return `${text}'${text.endsWith("s") ? "" : "s"}`;
}
export function formatCountable(
  count: number,
  singular: string,
  plural?: string,
) {
  return count === 1 ? singular : plural || singular + "s";
}
export function pad(
  input: string,
  direction: "left" | "right",
  padding: string,
  spaces: number,
) {
  while (padding.length < spaces) {
    padding += padding;
  }
  if (direction === "left") {
    return (padding + input).slice(-spaces);
  } else {
    return (input + padding).slice(0, Math.max(input.length, spaces));
  }
}
export function generateRandomString(byteCount: number) {
  const bytes = new Uint8Array(byteCount);
  window.crypto.getRandomValues(bytes);
  return bytes.reduce((result, byte) => result + byte.toString(16), "");
}
