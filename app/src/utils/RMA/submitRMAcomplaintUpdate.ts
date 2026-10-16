interface RMAItem {
    srNo: string;
    jobNo: string;
    modelNo: string;
    serialNo: string;
    reason: string;

}

export async function submitRMAcomplaintUpdate({

    secureUrl,
    complaintNo,
    customer,
    enggname,
    items,
    product

}: {
    enggname: string;
    secureUrl: string;
    customer: string;
    complaintNo: string;
    items: RMAItem[];
    product: string
}) {



    const body = new URLSearchParams();
    body.append("complaintNo", complaintNo);
    body.append("enggname", enggname);
    body.append("customer", customer);
    body.append("secureUrl", secureUrl);
    body.append("items", JSON.stringify({ items }));
    body.append("product", product)
    // Log the body data
    console.log(Object.fromEntries(body.entries()));

    try {
        const response = await fetch(
            "https://hma.magnum.org.in/NewappEnggRMAdata.php",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: body.toString(),
            }
        );

        const responseText = await response.text();


        let responseJson: any = {};
        try {
            // Extract the valid JSON substring between the first '{' and last '}'
            // to handle trailing characters/markdown code fences returned by PHP
            const firstBrace = responseText.indexOf("{");
            const lastBrace = responseText.lastIndexOf("}");
            const cleanJsonText =
                firstBrace !== -1 && lastBrace !== -1 && lastBrace >= firstBrace
                    ? responseText.substring(firstBrace, lastBrace + 1)
                    : responseText.trim();

            responseJson = JSON.parse(cleanJsonText);
            console.log("Parsed RMA response JSON:", responseJson);
        } catch (e) {
            console.error("Failed to parse RMA response JSON:", e, "Raw response:", responseText);
            responseJson = {};
        }
        return responseJson;
    } catch (error) {
        throw error;
    }
}

export default submitRMAcomplaintUpdate;
