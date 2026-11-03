import { describe, expect, it } from "vitest";

import { fromSeatmapNodes } from "../../../src/internal/peek/seatmaps/seatmap-converter.js";
import type { RawSeatmapNode } from "../../../src/internal/peek/seatmaps/seatmap-queries.js";
import { UnknownSeatmapDisplayTypeError } from "../../../src/errors.js";

/** A representative map node mirroring the shapes the gateway returns. */
function fullNode(): RawSeatmapNode {
  return {
    id: "csm_8j734",
    name: "Dinner Theater",
    zones: [
      {
        id: "csz_z77an",
        name: "Premium",
        resourceOptions: [{ id: "ro-1", name: "Adult - Premium" }],
      },
    ],
    sections: [
      // A decorative SHAPE: width/height/label/type populated, no groups.
      {
        id: "css_krn56",
        display: {
          height: 60,
          label: "Stage",
          type: "SHAPE",
          width: 200,
          x: 672,
          y: 366,
        },
        groups: [],
      },
      // A seatable SECTION: width/height/label null, one group with blocks.
      {
        id: "css_km8d5",
        display: {
          height: null,
          label: null,
          type: "SECTION",
          width: null,
          x: 800,
          y: 432,
        },
        groups: [
          {
            assignableTo: ["GUEST"],
            name: "Table 12",
            id: "csg_yj9ge",
            display: { table: true, tableHeight: 80, tableWidth: 120, x: 176, y: 256 },
            blocks: [
              {
                display: { x: 0, y: 0 },
                fullBlockName: "Table 12, Seat 1",
                id: "csb_a7bk8",
                name: "1",
                order: 0,
                zone: { id: "csz_zy3de" },
              },
            ],
          },
        ],
      },
    ],
  };
}

describe("fromSeatmapNodes", () => {
  it("maps a seating-map node into the clean model", () => {
    const [map] = fromSeatmapNodes([fullNode()]);

    expect(map).toMatchObject({ id: "csm_8j734", name: "Dinner Theater" });
    expect(map.zones).toEqual([
      {
        id: "csz_z77an",
        name: "Premium",
        tickets: [{ id: "ro-1", name: "Adult - Premium" }],
      },
    ]);
    expect(map.sections).toHaveLength(2);
  });

  it("fills a section's shared display and leaves table fields null", () => {
    const [map] = fromSeatmapNodes([fullNode()]);
    const shape = map.sections[0];

    expect(shape.display).toEqual({
      x: 672,
      y: 366,
      width: 200,
      height: 60,
      label: "Stage",
      type: "SHAPE",
      // Fields a section never carries collapse to null.
      tableWidth: null,
      tableHeight: null,
      table: null,
    });
    expect(shape.groups).toEqual([]);
  });

  it("fills a SECTION display with null width/height/label", () => {
    const [map] = fromSeatmapNodes([fullNode()]);
    const section = map.sections[1];

    expect(section.display).toEqual({
      x: 800,
      y: 432,
      width: null,
      height: null,
      label: null,
      type: "SECTION",
      tableWidth: null,
      tableHeight: null,
      table: null,
    });
  });

  it("fills a group display with table fields and nulls section-only fields", () => {
    const [map] = fromSeatmapNodes([fullNode()]);
    const group = map.sections[1].groups[0];

    expect(group).toMatchObject({
      id: "csg_yj9ge",
      name: "Table 12",
      assignableTo: ["GUEST"],
    });
    expect(group.display).toEqual({
      x: 176,
      y: 256,
      table: true,
      tableWidth: 120,
      tableHeight: 80,
      // Section-only fields collapse to null on a group.
      width: null,
      height: null,
      label: null,
      type: null,
    });
  });

  it("maps a block, keeping only x/y on its display and resolving zoneId", () => {
    const [map] = fromSeatmapNodes([fullNode()]);
    const block = map.sections[1].groups[0].blocks[0];

    expect(block).toEqual({
      id: "csb_a7bk8",
      name: "1",
      fullBlockName: "Table 12, Seat 1",
      order: 0,
      zoneId: "csz_zy3de",
      display: {
        x: 0,
        y: 0,
        width: null,
        height: null,
        tableWidth: null,
        tableHeight: null,
        table: null,
        label: null,
        type: null,
      },
    });
  });

  it("accepts every known display type", () => {
    const node: RawSeatmapNode = {
      id: "m",
      name: "m",
      sections: [
        { id: "a", display: { x: 0, y: 0, type: "SHAPE" }, groups: [] },
        { id: "b", display: { x: 0, y: 0, type: "SECTION" }, groups: [] },
        { id: "c", display: { x: 0, y: 0, type: "LABEL" }, groups: [] },
      ],
    };
    const [map] = fromSeatmapNodes([node]);
    expect(map.sections.map((s) => s.display.type)).toEqual([
      "SHAPE",
      "SECTION",
      "LABEL",
    ]);
  });

  it("throws UnknownSeatmapDisplayTypeError on an unrecognized type", () => {
    const node: RawSeatmapNode = {
      id: "m",
      name: "m",
      sections: [{ id: "a", display: { x: 0, y: 0, type: "CIRCLE" }, groups: [] }],
    };

    let caught: unknown;
    try {
      fromSeatmapNodes([node]);
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(UnknownSeatmapDisplayTypeError);
    expect((caught as UnknownSeatmapDisplayTypeError).type).toBe("CIRCLE");
  });

  it("treats a null group tableHeight as null (irregular table)", () => {
    const node: RawSeatmapNode = {
      id: "m",
      name: "m",
      sections: [
        {
          id: "a",
          display: { x: 0, y: 0, type: "SECTION" },
          groups: [
            {
              assignableTo: ["GUEST"],
              name: "Table 9",
              id: "g",
              display: { table: true, tableHeight: null, tableWidth: 60, x: -624, y: -256 },
              blocks: [],
            },
          ],
        },
      ],
    };
    const [map] = fromSeatmapNodes([node]);
    expect(map.sections[0].groups[0].display.tableHeight).toBeNull();
  });

  it("defaults a block's missing zone to a null zoneId", () => {
    const node: RawSeatmapNode = {
      id: "m",
      name: "m",
      sections: [
        {
          id: "a",
          display: { x: 0, y: 0, type: "SECTION" },
          groups: [
            {
              name: "g",
              id: "g",
              display: { x: 0, y: 0 },
              blocks: [
                {
                  display: { x: 0, y: 0 },
                  fullBlockName: "Unassigned",
                  id: "b",
                  name: "1",
                  order: 0,
                },
              ],
            },
          ],
        },
      ],
    };
    const [map] = fromSeatmapNodes([node]);
    expect(map.sections[0].groups[0].blocks[0].zoneId).toBeNull();
  });

  it("defaults missing optional collections to empty arrays", () => {
    const node: RawSeatmapNode = { id: "m", name: "m" };
    const [map] = fromSeatmapNodes([node]);

    expect(map.zones).toEqual([]);
    expect(map.sections).toEqual([]);
  });

  it("defaults missing group collections and assignableTo", () => {
    const node: RawSeatmapNode = {
      id: "m",
      name: "m",
      zones: [{ id: "z", name: "Z" }],
      sections: [
        {
          id: "a",
          display: { x: 0, y: 0, type: "SECTION" },
          groups: [{ name: "g", id: "g", display: { x: 0, y: 0 } }],
        },
      ],
    };
    const [map] = fromSeatmapNodes([node]);

    expect(map.zones[0].tickets).toEqual([]);
    expect(map.sections[0].groups[0].assignableTo).toEqual([]);
    expect(map.sections[0].groups[0].blocks).toEqual([]);
  });

  it("returns an empty list for no nodes", () => {
    expect(fromSeatmapNodes([])).toEqual([]);
  });
});
