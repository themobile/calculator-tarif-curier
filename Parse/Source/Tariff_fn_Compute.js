Parse.Cloud.define("ComputeTariff", function (request, response) {
    Parse.Cloud.useMasterKey();
    var colet = request.params.colet            // 0=plic; 1=colet
        , loco = request.params.loco            // 0=national; 1=loco
        , greutate = request.params.greutate       // greutate in kg a coletelor
        , lungime = request.params.lungime      // centimetrii
        , latime = request.params.latime        // cm
        , inaltime = request.params.inaltime    // cm

        , asigurare = request.params.asigurare      // RON
        , rambursval = request.params.rambursval    // RON
        , confirmare = request.params.confirmare           // true/false
        , returdoc = request.params.returdoc        // true/false
        ;

    var result = []
        ;

    var qTariff = new Parse.Query("Tariff");
    qTariff.notEqualTo("isDeleted", true);
    qTariff.find().then(function (tariffs) {
        _.each(tariffs, function (tariff) {
            var nTransport = 0
                , nGreutate
                , nVolumetric

                , nAsigurare = 0
                , nRamburs = 0
                , nReturDoc = 0
                , nIndex = 0
                , nTva = 0

                , nTotal = 0

                , doResult = true

                ;

            if (colet == 1) {
                //colet
                if (NZN(greutate) == 0) {
                    greutate = 1;
                }
                nGreutate = greutate;
                if (lungime > 0 && latime > 0 && inaltime > 0) {
                    nVolumetric = lungime * latime * inaltime / 6000;
                    if (nVolumetric > nGreutate) {
                        nGreutate = nVolumetric;
                    }
                }
                if (loco == 1) {
                    // loco
                    if (tariff.get("ColetPrimulKgLoco") > 0) {
                        nTransport += tariff.get("ColetPrimulKgLoco");
                        if (nGreutate > 1) {
                            nTransport += Math.ceil(nGreutate - 1) * tariff.get("ColetKgSuplimentarLoco");
                        }
                    } else {
                        nTransport += tariff.get("ColetPrimele10KgLoco");
                        if (nGreutate > 10) {
                            nTransport += Math.ceil(nGreutate - 10) * tariff.get("ColetKgSuplimentarLoco");
                        }
                    }
                } else {
                    // national
                    nTransport += tariff.get("ColetPrimulKgNational");
                    if (nGreutate > 1) {
                        nTransport += Math.ceil(nGreutate - 1) * tariff.get("ColetKgSuplimentarNational");
                    }
                }
            } else {
                //plic
                if (loco == 1) {
                    // loco
                    nTransport += tariff.get("PlicMax1KgLoco");
                } else {
                    // national
                    nTransport += tariff.get("PlicMax1KgNational");
                }
            }

            nGreutate = _ctcRound(NZN(nGreutate), 2);
            nTransport = _ctcRound(nTransport, 2);

            nAsigurare += NZN(asigurare) * tariff.get("Asigurare");
            nAsigurare = _ctcRound(nAsigurare, 2);

            if (NZN(rambursval) > 0) {
                nRamburs += tariff.get("RambursFix") + rambursval * tariff.get("RambursVariabil");
                //sa nu uit la popularea tarifului ca tuplul RambursVariabil+RambursFix sa fie completat exclusiv cu RambursNUmerarInContLoc si RambursNUmerarInContBational
                if (loco == 1) {
                    nRamburs += tariff.get("RambursNumerarFixLoco");
                } else {
                    nRamburs += tariff.get("RambursNumerarFixNational");
                }
            }
            nRamburs = _ctcRound(nRamburs, 2);

            if (returdoc || confirmare) {
                if (loco == 1) {
                    nReturDoc += tariff.get("ReturDocumenteLoco");
                } else {
                    nReturDoc += tariff.get("ReturDocumente");
                }
                if (nReturDoc == 0) {
                    if (loco == 1) {
                        nReturDoc += tariff.get("ConfirmareLivrareLoco");
                    } else {
                        nReturDoc += tariff.get("ConfirmareLivrare");
                    }
                }
            }
            nReturDoc = _ctcRound(nReturDoc, 2);

            nIndex += tariff.get("IndiceCombustibil") * nTransport + tariff.get("IndiceCombustibilAditionale") * (nAsigurare + nRamburs + nReturDoc);
            nIndex = _ctcRound(nIndex, 2);

            nTva += tariff.get("tva") * (nTransport + nAsigurare + nRamburs + nReturDoc + nIndex);
            nTva = _ctcRound(nTva, 2);

            nTotal += _ctcRound(nTransport + nAsigurare + nRamburs + nReturDoc + nIndex + nTva, 2);

            // elimin pt Posta;
            if (NZN(tariff.get("ConditieMinKg")) > 0) {
                if (nGreutate < NZN(tariff.get("ConditieMinKg"))) {
                    doResult = false;
                }
            }
            if (NZN(tariff.get("ConditieMaxKg")) > 0) {
                if (nGreutate > NZN(tariff.get("ConditieMaxKg"))) {
                    doResult = false;
                }
            }


            if (doResult) {
                result.push({
                    transportator: tariff.get("name"),
                    InfoKgMaxColet: tariff.get("InfoKgMaxColet"),
                    InfoCmMaxColet: tariff.get("InfoCmMaxColet"),
                    InfoNumeServiciuCurierat: tariff.get("InfoNumeServiciuCurierat"),
                    InfoNumarLocalitatiRetea: tariff.get("InfoNumarLocalitatiRetea"),
                    Telefon: tariff.get("Telefon"),
                    Url: tariff.get("Url"),
                    UrlComanda: tariff.get("UrlComanda"),
                    InfoGreutateTarifabila: nGreutate,
                    valoare: nTotal,
                    valoareTransport: nTransport,
                    valoareAsigurare: nAsigurare,
                    valoareRamburs: nRamburs,
                    valoareReturDocumente: nReturDoc,
                    valoareIndexCombustibil: nIndex,
                    valoareTva: nTva
                })
            }
        });

        response.success(result.sort(function (a, b) {
            if (a.valoare > b.valoare) {
                return 1;
            } else {
                if (a.valoare < b.valoare) {
                    return -1;
                } else {
                    if (a.valoareTransport > b.valoareTransport) {
                        return 1;
                    } else {
                        if (a.valoareTransport < b.valoareTransport) {
                            return -1;
                        } else {
                            return 0; //fixme: de sortat eventual alfabetic
                        }
                    }
                }
            }
        }));
    }, function (error) {
        response.error(error);
    });
});
