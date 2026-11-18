import org.springframework.cloud.contract.spec.Contract

Contract.make {
    description "returns availability in the public response shape"
    request {
        method GET()
        urlPath("/drivers/DR-7")
    }
    response {
        status OK()
        headers {
            contentType(applicationJson())
        }
        body([
            driverId: "DR-7",
            available: true
        ])
    }
}
