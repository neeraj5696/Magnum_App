export async function submitComplaintUpdate({
    enggname,
    remark,
    report,
    status,
    pendingreason,
  }: {
    enggname: string;
    remark: string;
    report: string;
    status: '1' | '0';
    pendingreason: string;
  }) {
    // ... existing code ...

// ... existing code ...

const body = new URLSearchParams();
body.append('complainno', 'C-20250520122');
body.append('enggname', 'NARAYAN SINGH'); // Updated value for enggname
body.append('remark', 'NULL'); // Updated value for remark
body.append('report', report);
body.append('status', status);
body.append('pendingreason', pendingreason);

// Log the body data
console.log(Object.fromEntries(body.entries()));

// ... existing code ...

// ... existing code ...
  
    try {
      const response = await fetch('https://hma.magnum.org.in/appEnggcomplainupdated.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });
  
      const responseText = await response.text();
      let responseJson;
      try {
        responseJson = JSON.parse(responseText);
      } catch (e) {
        responseJson = {};
      }
      return responseJson;
    } catch (error) {
      throw error;
    }
  }

  export default submitComplaintUpdate; 