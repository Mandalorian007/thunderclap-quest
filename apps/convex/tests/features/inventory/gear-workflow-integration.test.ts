import { describe, test, expect } from "vitest";
import { generateSampleGear } from "../../../convex/helpers/rewardHelpers";
import { createTestInstance } from "../../helpers/test-utils";
import { api } from "../../../convex/_generated/api";

describe("Complete Gear Workflow Integration", () => {
  test("full gear testing workflow - add, autocomplete, equip, unequip, salvage", async () => {
    const t = createTestInstance();

    // 1. Create player (simulates ensurePlayerExists in Discord commands)
    await t.mutation(api.features.profile.functions.createPlayer, {
      userId: "test-user",
      displayName: "Test User"
    });

    // 2. Simulate /add-gear command - generate and award gear
    const gearData = generateSampleGear(5, "mainHand");
    const addedGear = await t.mutation(api.features.inventory.functions.awardGear, {
      userId: "test-user",
      gearData
    });

    expect(addedGear.name).toBeDefined();
    expect(addedGear.slot).toBe("mainHand");
    expect(addedGear.itemLevel).toBe(5);

    // 3. Test autocomplete for /equip command - should find the gear
    const autocompleteResult = await t.query(api.features.inventory.functions.getUnequippedGearForAutocomplete, {
      userId: "test-user"
    });

    expect(autocompleteResult).toHaveLength(1);
    expect(autocompleteResult[0].id).toBe(addedGear.id);
    expect(autocompleteResult[0].displayName).toContain(addedGear.name);

    // 4. Simulate /equip command - equip the gear
    const equipResult = await t.mutation(api.features.inventory.functions.equipGear, {
      userId: "test-user",
      gearId: addedGear.id
    });

    expect(equipResult.equippedGear.id).toBe(addedGear.id);
    expect(equipResult.previousGear).toBeNull(); // No previous gear

    // 5. Verify gear is no longer in autocomplete (it's equipped)
    const autocompleteAfterEquip = await t.query(api.features.inventory.functions.getUnequippedGearForAutocomplete, {
      userId: "test-user"
    });

    expect(autocompleteAfterEquip).toHaveLength(0);

    // 6. Verify equipped gear shows up in player profile
    const playerWithGear = await t.query(api.features.inventory.functions.getPlayerWithGear, {
      userId: "test-user"
    });

    expect(playerWithGear.equippedGear.mainHand).toBeDefined();
    expect(playerWithGear.equippedGear.mainHand.id).toBe(addedGear.id);

    // 7. Simulate /unequip command - unequip the gear
    const unequipResult = await t.mutation(api.features.inventory.functions.unequipGear, {
      userId: "test-user",
      slot: "mainHand"
    });

    expect(unequipResult.id).toBe(addedGear.id);

    // 8. Verify gear is back in autocomplete (it's unequipped)
    const autocompleteAfterUnequip = await t.query(api.features.inventory.functions.getUnequippedGearForAutocomplete, {
      userId: "test-user"
    });

    expect(autocompleteAfterUnequip).toHaveLength(1);
    expect(autocompleteAfterUnequip[0].name).toBe(addedGear.name);
    expect(autocompleteAfterUnequip[0].slot).toBe(addedGear.slot);

    // 9. Test salvage integration - should remove gear from inventory
    const gearCountBeforeSalvage = await t.mutation(api.features.inventory.functions.salvageAllGear, {
      userId: "test-user"
    });

    expect(gearCountBeforeSalvage).toBe(1); // One piece was salvaged

    // 10. Verify gear is gone from autocomplete after salvage
    const autocompleteAfterSalvage = await t.query(api.features.inventory.functions.getUnequippedGearForAutocomplete, {
      userId: "test-user"
    });

    expect(autocompleteAfterSalvage).toHaveLength(0);
  });

  test("gear swapping workflow - equipping gear with occupied slots", async () => {
    const t = createTestInstance();

    // Create player
    await t.mutation(api.features.profile.functions.createPlayer, {
      userId: "test-user",
      displayName: "Test User"
    });

    // Add two main hand weapons
    const sword = await t.mutation(api.features.inventory.functions.awardGear, {
      userId: "test-user",
      gearData: generateSampleGear(10, "mainHand")
    });

    const axe = await t.mutation(api.features.inventory.functions.awardGear, {
      userId: "test-user",
      gearData: generateSampleGear(15, "mainHand")
    });

    // Equip first weapon
    await t.mutation(api.features.inventory.functions.equipGear, {
      userId: "test-user",
      gearId: sword.id
    });

    // Autocomplete should only show the axe
    const autocompleteWithEquipped = await t.query(api.features.inventory.functions.getUnequippedGearForAutocomplete, {
      userId: "test-user"
    });

    expect(autocompleteWithEquipped).toHaveLength(1);
    expect(autocompleteWithEquipped[0].id).toBe(axe.id);

    // Equip second weapon (should swap with first)
    const swapResult = await t.mutation(api.features.inventory.functions.equipGear, {
      userId: "test-user",
      gearId: axe.id
    });

    expect(swapResult.equippedGear.id).toBe(axe.id);
    expect(swapResult.previousGear?.id).toBe(sword.id);

    // Autocomplete should now show the sword
    const autocompleteAfterSwap = await t.query(api.features.inventory.functions.getUnequippedGearForAutocomplete, {
      userId: "test-user"
    });

    expect(autocompleteAfterSwap).toHaveLength(1);
    expect(autocompleteAfterSwap[0].name).toBe(sword.name);
    expect(autocompleteAfterSwap[0].slot).toBe(sword.slot);
  });

  test("autocomplete search filtering", async () => {
    const t = createTestInstance();

    // Create player
    await t.mutation(api.features.profile.functions.createPlayer, {
      userId: "test-user",
      displayName: "Test User"
    });

    // Add gear with different names and rarities
    await t.mutation(api.features.inventory.functions.awardGear, {
      userId: "test-user",
      gearData: {
        name: "Iron Sword",
        emoji: "⚔️",
        slot: "mainHand",
        itemLevel: 10,
        combatRating: 10,
        rarity: "Common",
        stats: { Might: 5 }
      }
    });

    await t.mutation(api.features.inventory.functions.awardGear, {
      userId: "test-user",
      gearData: {
        name: "Steel Helmet",
        emoji: "⛑️",
        slot: "helm",
        itemLevel: 12,
        combatRating: 12,
        rarity: "Magic",
        stats: { Armor: 8 }
      }
    });

    await t.mutation(api.features.inventory.functions.awardGear, {
      userId: "test-user",
      gearData: {
        name: "Rare Staff",
        emoji: "🔮",
        slot: "mainHand",
        itemLevel: 15,
        combatRating: 15,
        rarity: "Rare",
        stats: { Sage: 10 }
      }
    });

    // Test filtering by name
    const swordFilter = await t.query(api.features.inventory.functions.getUnequippedGearForAutocomplete, {
      userId: "test-user",
      searchTerm: "sword"
    });
    expect(swordFilter).toHaveLength(1);
    expect(swordFilter[0].name).toBe("Iron Sword");

    // Test filtering by rarity
    const rareFilter = await t.query(api.features.inventory.functions.getUnequippedGearForAutocomplete, {
      userId: "test-user",
      searchTerm: "rare"
    });
    expect(rareFilter).toHaveLength(1);
    expect(rareFilter[0].name).toBe("Rare Staff");

    // Test filtering by slot
    const mainHandFilter = await t.query(api.features.inventory.functions.getUnequippedGearForAutocomplete, {
      userId: "test-user",
      searchTerm: "mainhand"
    });
    expect(mainHandFilter).toHaveLength(2); // Iron Sword and Rare Staff

    // Test no filter - should return all
    const noFilter = await t.query(api.features.inventory.functions.getUnequippedGearForAutocomplete, {
      userId: "test-user"
    });
    expect(noFilter).toHaveLength(3);
  });
});