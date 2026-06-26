import { Level } from "../types";
import { levels } from "../levelsData";

export interface StressTestResult {
  levelId: number;
  levelTitle: string;
  solutionTestPassed: boolean;
  blankTestPassed: boolean; // should fail, meaning rules are active
  ruleResults: {
    ruleId: string;
    description: string;
    passedWithSolution: boolean;
    passedWithBlank: boolean;
  }[];
}

/**
 * Sandboxes a level validation. It temporarily mounts the HTML and styles,
 * runs the level's rules, and cleans up after itself.
 */
export const runStressTestOnLevel = (level: Level): StressTestResult => {
  const container = document.createElement("div");
  container.id = `stress-test-sandbox-l${level.id}`;
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "-9999px";
  container.style.visibility = "hidden";
  container.innerHTML = level.initialHtml;
  document.body.appendChild(container);

  // 1. Create a style tag to apply styles to the document so getComputedStyle works perfectly
  const styleTag = document.createElement("style");
  styleTag.id = `stress-test-style-l${level.id}`;
  document.head.appendChild(styleTag);

  const ruleResults: StressTestResult["ruleResults"] = [];

  // --- TEST A: Run with Solution CSS ---
  styleTag.textContent = level.solutionCss;
  let allSolutionPassed = true;

  level.validationRules.forEach((rule) => {
    let passed = false;
    try {
      passed = rule.validate(container, level.solutionCss);
    } catch (err) {
      console.error(`Error in rule ${rule.id} of level ${level.id} with solution:`, err);
    }
    if (!passed) allSolutionPassed = false;

    ruleResults.push({
      ruleId: rule.id,
      description: rule.description,
      passedWithSolution: passed,
      passedWithBlank: false, // will update in step B
    });
  });

  // --- TEST B: Run with Initial/Blank CSS ---
  styleTag.textContent = level.initialCss || "";
  let anyBlankPassed = false;

  level.validationRules.forEach((rule, idx) => {
    let passed = false;
    try {
      passed = rule.validate(container, level.initialCss || "");
    } catch (err) {
      // expected or safe
    }
    if (passed) anyBlankPassed = true;
    ruleResults[idx].passedWithBlank = passed;
  });

  // Cleanup
  document.body.removeChild(container);
  document.head.removeChild(styleTag);

  return {
    levelId: level.id,
    levelTitle: level.title,
    solutionTestPassed: allSolutionPassed,
    blankTestPassed: !anyBlankPassed, // true if blank CSS correctly fails (desired validator behavior)
    ruleResults,
  };
};

/**
 * Runs the complete suite of tests over all levels
 */
export const runFullStressTestSuite = (): StressTestResult[] => {
  return levels.map((lvl) => runStressTestOnLevel(lvl));
};
