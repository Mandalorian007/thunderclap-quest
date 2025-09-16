# Encounter Mechanics & Damage System

## Core Combat Triangle

### **Attack Types vs Defense Types**
- **Might attacks** → Target **Armor** defense
- **Focus attacks** → Target **Evasion** defense
- **Sage attacks** → Target **Aegis** defense

### **Base Damage Calculation**

```
Attacker Damage = Offensive Stat + Combat Rating Multiplier
Defender Reduction = Corresponding Defensive Stat
Net Damage = Attacker Damage - Defender Reduction
```

### **Combat Rating Integration**
- **Combat Rating** provides universal damage/defense multiplier based on gear progression
- **CR Difference** = Player CR - Game Level
- **CR Multiplier** = 1 + min(max(CR Difference × 0.003, -0.60), 0.60)
- **Scaling**: Each CR point = 0.3% difference, capped at ±60%
- Applied to both damage dealt and damage reduction

### **CR Scaling Examples**
```
+200 CR (ahead): 1.60 multiplier (60% bonus) - CAPPED
+100 CR (ahead): 1.30 multiplier (30% bonus)
+50 CR (ahead): 1.15 multiplier (15% bonus)
0 CR (current): 1.00 multiplier (baseline)
-50 CR (behind): 0.85 multiplier (15% penalty)
-100 CR (behind): 0.70 multiplier (30% penalty)
-200 CR (behind): 0.40 multiplier (60% penalty) - CAPPED
```

### **Encounter Examples**

**Melee Combat Encounter:**
```
CR Multiplier = 1 + min(max((Player CR - Game Level) × 0.003, -0.60), 0.60)
Net Damage = (Player Might × CR Multiplier) - (Enemy Armor ÷ CR Multiplier)
```

**Ranged Combat Encounter:**
```
CR Multiplier = 1 + min(max((Player CR - Game Level) × 0.003, -0.60), 0.60)
Net Damage = (Player Focus × CR Multiplier) - (Enemy Evasion ÷ CR Multiplier)
```

**Magic Combat Encounter:**
```
CR Multiplier = 1 + min(max((Player CR - Game Level) × 0.003, -0.60), 0.60)
Net Damage = (Player Sage × CR Multiplier) - (Enemy Aegis ÷ CR Multiplier)
```

### **Strategic Build Implications**

**High Might Build:**
- Excels against low-armor enemies
- Struggles against heavily armored foes
- Optimal for direct combat encounters

**High Focus Build:**
- Excels against slow/heavy enemies
- Struggles against agile opponents
- Optimal for precision/ranged encounters

**High Sage Build:**
- Excels against mundane/non-magical enemies
- Struggles against magic-resistant foes
- Optimal for puzzle/knowledge encounters

**Balanced Build:**
- Consistent performance against all enemy types
- No major strengths or weaknesses
- Versatile for varied encounter content

## Future Expansion Areas

### **Skill Multipliers (Post-MVP)**
- Encounter-specific skill bonuses
- Player abilities that modify base calculations
- Situational damage modifiers

### **Secondary Stat Effects (Post-MVP)**
- Additional layers beyond the core 6 stats
- Special gear properties and effects
- Advanced combat mechanics

### **Encounter Complexity (Post-MVP)**
- Multi-phase encounters using different attack types
- Environmental factors affecting calculations
- Team-based mechanics for group content