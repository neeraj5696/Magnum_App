 async function getEpbaxData() {
    try {
        const response = await fetch('https://hma.magnum.org.in/appEPABX.php');
        if (response.ok) {
            const json = await response.json();
            const actual_data = json.data;
            const grouped= {};
            actual_data.forEach(item => {
                if (!grouped[item.SystemName]) {
                    grouped[item.SystemName] = [];
                }
                grouped[item.SystemName].push(item.Parts);
            });
            
          console.log(grouped)
        } else {
            console.error(`http err: ${response.status}`);
        }
    } catch (error) {
        console.error('failed to fetch the data:', error);
    }
    return {};
}
let data = getEpbaxData()

console.log(Object.keys(data))