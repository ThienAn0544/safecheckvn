function getFilteredWarnings(warnings) {
    const type = document.getElementById("typeFilter").value;
    const bank = document.getElementById("bankFilter").value;
    const days = Number(document.getElementById("timeFilter").value);

    const search = document.getElementById("searchInput")
        .value.trim().toLowerCase();

    const today = new Date("2026-11-17T12:00:00");

    return warnings.filter(item => {
        const dateDiff =
            (today - new Date(item.date + "T12:00:00")) /
            (1000 * 60 * 60 * 24);

        return (!type || item.type === type) &&
            (!bank || item.bank === bank) &&
            (!days || dateDiff <= days) &&
            (!search ||
                (item.title + " " + item.target)
                .toLowerCase().includes(search));
    });
}
