export async function getGeoLocation() {
    try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        return {
            country: data.country_name,
            city: data.city,
            region: data.region,
            isKenya: data.country_code === "KE"
        };
    } catch (error) {
        console.error("GeoLocation lookup failed", error);
        return { country: "Unknown", isKenya: true }; // Default for MVP if API fails
    }
}

export function restrictToKenya(countryCode: string) {
    if (countryCode !== "KE") {
        throw new Error("StockWatch is currently only available in Kenya.");
    }
}
