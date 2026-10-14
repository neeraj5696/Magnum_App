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


        console.log(responseText, "response")
        let responseJson;
        try {
            responseJson = JSON.parse(responseText);
            console.log('try me aa gaya ', responseJson)
        } catch (e) {
            responseJson = {};
        }
        return responseJson;
    } catch (error) {
        throw error;
    }
}

export default submitRMAcomplaintUpdate;
