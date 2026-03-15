app.controller('homeController', function ($scope, $rootScope, $timeout) {
    // Access Zoho PageLoad data
    $rootScope.pageEntity = pageLoad;
    $scope.isLoading = false;
    $scope.errors = {};

    console.log($rootScope.pageEntity)
    ZOHO.CRM.API.getRecord({
        Entity: $rootScope.pageEntity.Entity,
        RecordID: $rootScope.pageEntity.EntityId
    }).then(function (data) {
        console.log(data)
        if (data.data && data.data.length > 0) {
            JobCardDetails = data.data[0];
            $scope.form.jobCardName = JobCardDetails.Name;
            $scope.form.jobCardId = JobCardDetails.id;
            $scope.form.customerid = JobCardDetails.Customer_Name.id;
            $scope.form.customer = JobCardDetails.Customer_Name.name;
            let zohoDate = JobCardDetails.Check_In_Date_Time.split("T")[0]; // 2026-03-13
            let parts = zohoDate.split("-");
            let tempdate = new Date(parts[0], parts[1] - 1, parts[2]);
            $scope.form.checkInDay = tempdate;
            $scope.$apply()
        }
    })

    $scope.clearErrors = function () {
        $scope.errors = {};
    };

    $scope.isAddRowDisabled = function () {

        if (!$scope.form.delayedDays)
            return false;

        if ($scope.totalDays >= $scope.form.delayedDays)
            return true;

        return false;
    };
    $scope.showToast = function (message, type) {
        $scope.toastMessage = message;
        // Set custom colors based on type
        switch (type) {
            case 'success':
                $scope.toastBgColor = '#28a745';  // Green
                $scope.toastTextColor = '#ffffff';
                break;
            case 'error':
                $scope.toastBgColor = '#dc3545';  // Red
                $scope.toastTextColor = '#ffffff';
                break;
            case 'warning':
                $scope.toastBgColor = '#ffc107';  // Amber
                $scope.toastTextColor = '#000000';
                break;
            case 'info':
                $scope.toastBgColor = '#2277f5';  // Blue
                $scope.toastTextColor = '#ffffff';
                break;
            default:
                $scope.toastBgColor = '#343a40';  // Dark gray fallback
                $scope.toastTextColor = '#ffffff';
        }
        $scope.$applyAsync();

        setTimeout(function () {
            var toastEl = document.getElementById('commonToast');
            var toast = new bootstrap.Toast(toastEl, { delay: 4000 });
            toast.show();
        }, 100);
    };
    $scope.showToast(
        "Zoho Connected",
        "success"
    );

    $scope.form = {};

    $scope.delayReasons = [
        "Customer check-in at day end",
        "Delay in diagnosis",
        "HO approval delayed",
        "Parts was not available in stock at Oben Care Centre",
        "Parts delayed to dispatch by HO",
        "Insurance Company approval delay",
        "Insurance Company process delay",
        "Customer approval to start repair delay",
        "Customer payment delay",
        "RFD vehicle, awaiting customer for vehicle receiving",
        "Long time take to Repair vehicle",
        "Customer documentation delay",
        "Testing/ monitoring/ Observing vehicle condition",
        "DMS related system issue (error/ glitch/ limitation)",
        "Festival Holiday (Oben Care Centre closed)",
        "Oben Care Staff on Leave",
        "External repair (outside job)",
        "Government Restriction for Oben Care Operations",
        "Battery repair at HO",
        "Motor repair at HO",
        "Logistic/ Courier delay",
        "Others"
    ];

    $scope.delayRows = [
        { reason: null, days: "", description: "" }
    ];

    $scope.totalDays = 0;

    $scope.addRow = function () {

        if ($scope.delayRows.length >= $scope.delayReasons.length) {
            $scope.showToast("All delay reasons already added", "warning");
            return;
        }

        $scope.delayRows.push({
            reason: null,
            days: "",
            description: ""
        });
    };
    $scope.deleteRow = function (index) {

        $scope.delayRows.splice(index, 1);

        $scope.updateTotal();
    };
    $scope.getAvailableReasons = function (rowIndex) {

        var selected = $scope.delayRows
            .map(r => r.reason);

        return $scope.delayReasons.filter(reason => {

            if ($scope.delayRows[rowIndex].reason === reason)
                return true;

            return !selected.includes(reason);
        });

    };

    $scope.isSubmitEnabled = function () {

        if (!$scope.form.delayedDays)
            return false;

        if ($scope.totalDays <= 0)
            return false;

        if ($scope.totalDays != $scope.form.delayedDays)
            return false;

        return true;
    };

    $scope.updateTotal = function () {

        let total = 0;

        $scope.delayRows.forEach(function (row) {

            if (row.days)
                total += Number(row.days);

        });

        $scope.totalDays = total;
    };
    $scope.calculateDays = function () {

        if (!$scope.form.checkInDay || !$scope.form.gatePassDay)
            return;

        let start = new Date($scope.form.checkInDay);
        let end = new Date($scope.form.gatePassDay);

        let diff = (end - start) / (1000 * 60 * 60 * 24);

        $scope.form.delayedDays = diff >= 0 ? diff : 0;
    };

    $scope.validateForm = function () {

        $scope.clearErrors();

        // reset row errors
        $scope.delayRows.forEach(function (row) {
            row.reasonError = false;
            row.daysError = false;
        });

        if (!$scope.form.checkInDay) {
            $scope.errors.checkInDay = true;
            $scope.showToast("Check In Day Required", "error");
            return false;
        }

        if (!$scope.form.gatePassDay) {
            $scope.errors.gatePassDay = true;
            $scope.showToast("Gate Pass Day Required", "error");
            return false;
        }

        if ($scope.totalDays != $scope.form.delayedDays) {
            $scope.errors.totalDays = true;
            $scope.showToast("Total Delay Days must match Delayed Days", "error");
            return false;
        }

        for (let i = 0; i < $scope.delayRows.length; i++) {

            let row = $scope.delayRows[i];

            if (!row.reason) {

                row.reasonError = true;   // only this row
                $scope.showToast("Please select delay reason in row " + (i + 1), "error");

                return false;
            }

            if (!row.days) {

                row.daysError = true;    // only this row
                $scope.showToast("Delay days required in row " + (i + 1), "error");

                return false;
            }
        }

        return true;
    };

    $scope.prepareJson = function () {

        let payload = {

            delay_name: $scope.form.delayName,
            job_card_id: $scope.form.jobCardId,
            customer: $scope.form.customerid,

            checkin_day: $scope.form.checkInDay,
            gatepass_day: $scope.form.gatePassDay,

            delayed_days: $scope.form.delayedDays,
            total_delay_days: $scope.totalDays,

            delay_reasons: $scope.delayRows.map(function (row) {

                return {
                    reason: row.reason,
                    days: row.days,
                    description: row.description
                };

            })

        };

        return payload;
    };


    $scope.submitForm = function () {

        if (!$scope.validateForm())
            return;

        let payload = $scope.prepareJson();

        console.log("Payload ->", payload);

        $scope.isLoading = true;

        ZOHO.CRM.FUNCTIONS.execute("create_reason_for_delay_record_widget", { arguments: JSON.stringify(payload) }).then(function (response) {
            if (response.details && response.details.output && response.details.output) {
                responseDtls = response.details.output;
                responseJson = JSON.parse(responseDtls);
                if (responseJson.code == 200) {

                    $scope.showToast(responseJson.message, "success");
                    $scope.secondsLeft = 10;
                    let timer = setInterval(() => {
                        $scope.secondsLeft--;
                        $scope.CancelFormHideMsg =
                            "Reason for delay Created Successfully. This Window will automatically closing in " + $scope.secondsLeft + " seconds.";
                            $scope.isLoading = false;
                        $scope.$applyAsync();

                        if ($scope.secondsLeft === 0) {
                            clearInterval(timer);
                            ZOHO.CRM.UI.Popup.close();
                        }
                    }, 1000);
                }
                else {
                    $scope.isLoading = false;
                    $scope.showToast(responseJson.message, "error");
                }
            }
            $scope.isLoading = false;
            console.log(response);

        }).catch(function (err) {

            $scope.isLoading = false;

            $scope.showToast("Error saving record", "error");

            console.error(err);

        });

    };

});