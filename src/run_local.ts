import {parser5verst} from "./parser.js";
import {formatSummary} from "./summary.js";

(async () => {
    try {
        const text = '04.01.2025';
        const data = await parser5verst(text);
        if (data) {
            const summary = formatSummary(data);
            console.log(summary);
        } else {
            console.error('Error fetching data from 5 Verst');
        }
    } catch (error) {
        console.error('Failed to fetch summary:', error);
    }
})();
