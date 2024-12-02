import React from "react";
import { MarkerType, Position } from "@xyflow/react";

export const nodes = [
  {
    id: "1",
    type: "customNode",
    position: { x: 100, y: 200 },
    component_name: "vpc",
  },
  {
    id: "6",
    type: "customNode",
    position: { x: 800, y: 200 },
    component_name: "security_group",
  },
  {
    id: "2",
    type: "customNode",
    position: { x: 800, y: 200 },
    component_name: "subnet",
  },
  {
    id: "3",
    type: "customNode",
    position: { x: 800, y: 600 },
    component_name: "subnet",
  },
];

export const edges = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    type: "smoothstep",
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
  {
    id: "esg1-1",
    source: "1",
    target: "6",
    type: "smoothstep",
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
];

export const components = {
  vpc: {
    type: "customNode",
    component_name: "vpc",
    data: {
      header: {
        icon: "vpc",
        label: "VPC",
        sub_label: "Virtual private cloud",
        info: (
          <>
            <h2 style={{ borderBottom: "1px solid #eaeded" }}>VPC</h2>
            <p>
              Amazon Virtual Private Cloud (Amazon VPC) enables you to launch
              AWS resources into a virtual network that you've defined. This
              virtual network closely resembles a traditional network that you'd
              operate in your own data center, with the benefits of using the
              scalable infrastructure of AWS.
            </p>
          </>
        ),
      },
      footer: {
        notes:
          "Note: Your Instances will launch in the {{default_info.region}} region.",
      },
      fields: [
        {
          type: "card",
          label: "VPC settings",
          sub_label: "",
          info: null,
          fields: [
            {
              name: "vpc_name",
              sub_label:
                "Creates a tag with a key of 'Name' and a value that you specify.",
              hint: "",
              label: "Name tag - optional",
              type: "text",
              error_text: "",
              required: false,
              size: 12,
              value: "",
              placeholder: "myproject-production-network-vpc",
              info: (
                <>
                  <p>
                    <strong>Name tag:</strong> (Optional) Name to be used as an
                    identifier for the VPC.
                  </p>
                  <p>
                    <strong>Type:</strong> string
                  </p>
                  <p>
                    <strong>Default value:</strong> "" (empty string)
                  </p>

                  <h3>Best Practices:</h3>
                  <ul>
                    <li>
                      Choose a meaningful and unique name for the VPC that
                      reflects its purpose or environment.
                    </li>
                    <li>
                      Follow a consistent naming convention for all resources to
                      improve clarity and organization.
                    </li>
                    <li>
                      <code>
                        projectName-environmentName-vpcPurpose[-additionalInfo]
                      </code>
                    </li>
                  </ul>
                  <p>
                    <strong>Example:</strong> "myproject-production-network-vpc"
                  </p>

                  <h3>Considerations:</h3>
                  <ul>
                    <li>
                      The VPC name is used as an identifier for the VPC
                      resource.
                    </li>
                    <li>
                      Ensure the name adheres to naming conventions and
                      restrictions.
                    </li>
                  </ul>

                  <h3>Validation:</h3>
                  <ul>
                    <li>
                      The name should be a string with a maximum length of 50
                      characters.
                    </li>
                    <li>
                      Allowed characters: Alphanumeric, underscores, and dashes.
                    </li>
                  </ul>

                  <h3>Note:</h3>
                  <p>
                    Use a name that helps easily identify the VPC's purpose or
                    environment in a multi-resource environment.
                  </p>
                </>
              ),
            },
            {
              name: "use_ipam_pool",
              label: "IPv4 CIDR block",
              type: "radio",
              size: 12,
              required: true,
              value: "false",
              info: (
                <>
                  <h2 style={{ borderBottom: "1px solid #eaeded" }}>
                    IPv4 CIDR block
                  </h2>
                  <p>
                    Specify an IPv4 CIDR block (or IP address range) for your
                    VPC.
                  </p>
                  <p>
                    If there is an Amazon VPC IP Address Manager (IPAM) IPv4
                    address pool available in this Region, you can get a CIDR
                    from an IPAM pool. If you select an IPAM pool, the size of
                    the CIDR is limited by the allocation rules on the IPAM pool
                    (allowed minimum, allowed maximum, and default).
                  </p>
                  <p>
                    If there is no IPv4 IPAM pool in this Region, you can
                    manually input an IPv4 CIDR. The CIDR block size must have a
                    size between /16 and /28.
                  </p>
                </>
              ),
              options: [
                {
                  value: "false",
                  label: "IPv4 CIDR manual input",
                },
                {
                  value: "true",
                  label: "IPAM-allocated IPv4 CIDR block",
                  disabled: true
                },
              ],
            },
            {
              depends_on: "values.use_ipam_pool === 'false'",
              name: "cidr",
              sub_label: "",
              placeholder: "10.0.0.0/24",
              label: "IPv4 CIDR",
              hint: "CIDR block size must be between /16 and /28.",
              type: "text",
              error_text: "CIDR cannot be empty",
              required: true,
              size: 12,
              value: "",
              info: (
                <>
                  <p>
                    <strong>Description:</strong> The IPv4 CIDR block for the
                    VPC.
                  </p>
                  <p>
                    <strong>Type:</strong> string
                  </p>
                  <p>
                    <strong>Default:</strong> ""
                  </p>

                  <h3>Example:</h3>
                  <ul>
                    <li>Specify CIDR block: "10.1.0.0/16"</li>
                  </ul>

                  <h3>Note:</h3>
                  <ul>
                    <li>
                      CIDR block size must be between <code>/16</code> and{" "}
                      <code>/28</code>.
                    </li>
                  </ul>
                </>
              ),
            },
            {
              depends_on: "values.use_ipam_pool === 'true'",
              name: "ipv6_ipam_pool_id",
              sub_label: "",
              placeholder: "Choose an IPAM pool",
              label: "IPv4 IPAM pool",
              hint: "The locale of the IPAM pool must be equal to the current region.",
              type: "select",
              error_text: "IPv4 IPAM pool selection is required.",
              required: "values.use_ipam_pool === 'true'",
              size: 12,
              value: "",
              options: [],
              info: null,
            },
            {
              depends_on: "values.use_ipam_pool === 'true'",
              name: "ipv6_netmask_length",
              sub_label: "",
              placeholder: "Choose a netmask",
              label: "Netmask",
              hint: "",
              type: "select",
              error_text: "Netmask selection is required.",
              required: "values.use_ipam_pool === 'true'",
              size: 12,
              value: "",
              options: [],
              info: null,
            },
            {
              name: "enable_ipv6",
              label: "IPv6 CIDR block",
              type: "radio",
              size: 12,
              required: true,
              value: "false",
              info: (
                <>
                  <h2 style={{ borderBottom: "1px solid #eaeded" }}>
                    IPv6 CIDR block
                  </h2>
                  <p>Specifying an IPv6 CIDR Block for Your VPC</p>
                  <p>
                    If there is an Amazon VPC IP Address Manager (IPAM) IPv6
                    address pool available in this Region, you can provision a
                    CIDR from an IPAM pool.
                  </p>
                  <p>
                    If there is no IPv6 IPAM pool in this Region, Amazon can
                    provide the IPv6 CIDR for you. Amazon provides a fixed IPv6
                    CIDR block size of /56. You cannot configure the size of the
                    IPv6 CIDR that Amazon provides.
                  </p>
                  <p>
                    If you have brought your own IPv6 CIDR to AWS, you can
                    specify an IPv6 CIDR block from your address pool.
                  </p>
                </>
              ),
              options: [
                {
                  value: "false",
                  label: "No IPv6 CIDR block",
                },
                {
                  value: "IPAM-allocated_IPv6_CIDR_block",
                  label: "IPAM-allocated IPv6 CIDR block",
                  disabled: true
                },
                {
                  value: "Amazon-provided_IPv6_CIDR_block",
                  label: "Amazon-provided IPv6 CIDR block",
                  disabled: true
                },
                {
                  value: "IPv6_CIDR_owned_by_me",
                  label: "IPv6 CIDR owned by me",
                  disabled: true
                },
              ],
            },
            {
              name: "instance_tenancy",
              label: "Tenancy",
              type: "select",
              size: 12,
              required: true,
              value: "default",
              info: (
                <>
                  <h2 style={{ borderBottom: "1px solid #eaeded" }}>Tenancy</h2>
                  <p>
                    You can run instances in your VPC on single-tenant,
                    dedicated hardware.
                  </p>
                  <p>
                    Select <strong>Default</strong> to ensure that instances
                    launched in this VPC use the tenancy attribute specified at
                    launch or if you are creating a VPC for Outposts private
                    connectivity.
                  </p>
                  <p>
                    Select <strong>Dedicated</strong> to ensure that instances
                    launched in this VPC are run on dedicated tenancy instances
                    regardless of the tenancy attribute specified at launch.
                  </p>
                  <p>
                    If your Outposts VPCs require private connectivity, you must
                    select <strong>Default</strong>.
                  </p>
                </>
              ),
              options: [
                {
                  value: "default",
                  label: "Default",
                },
                {
                  value: "dedicated",
                  label: "Dedicated",
                },
              ],
            },
          ],
        },
        {
          type: "card",
          label: "Tags",
          sub_label:
            "A tag is a label that you assign to an AWS resource. Each tag consists of a key and an optional value. You can use tags to search and filter your resources or track your AWS costs.",
          info: null,
          fields: [
            {
              name: "tags",
              label: "",
              sub_label: "",
              hint: "You can add 50 tags",
              type: "list<key-value>",
              size: 12,
              required: true,
              value: {
                created_by: "{{default_info.user_name}}",
              },
              config: {
                key: {
                  name: "key",
                  label: "Key",
                  sub_label: "",
                  required: true,
                  error_text: "You must specify a tag key",
                  size: 5,
                  type: "text",
                  info: null,
                },
                value: {
                  name: "value",
                  label: "Value - optional",
                  sub_label: "",
                  size: 5,
                  type: "text",
                  info: null,
                },
                add_button: {
                  label: "Add new tag",
                  variant: "outlined",
                  icon: "",
                },
                remove_button: {
                  label: "Delete",
                  variant: "outlined",
                  icon: "fa-trash",
                  style: {
                    fontSize: "24px",
                    color: "#d11a2a",
                    cursor: "pointer",
                  },
                  size: 2,
                },
              },
              info: null,
            },
          ],
        },
      ],
      values: {
        use_ipam_pool: "false",
        enable_ipv6: "false",
        instance_tenancy: "default",
        tags: {
          created_by: "{{default_info.user_name}}",
        },
      },
      handles: [
        {
          type: "source",
          position: Position.Right,
        },
      ],
    },
  },
  subnet: {
    type: "customNode",
    component_name: "subnet",
    data: {
      header: {
        icon: "vpc",
        label: "Subnet",
        sub_label: "VPC feature",
        info: (
          <>
            <h2 style={{ borderBottom: "1px solid #eaeded" }}>Subnet</h2>
            <p>
              To add a new subnet to your VPC, you must specify an IPv4 CIDR
              block for the subnet from the range of your VPC. You can specify
              the Availability Zone in which you want the subnet to reside. You
              can have multiple subnets in the same Availability Zone.
            </p>
            <p>
              You can optionally specify an IPv6 CIDR block for your subnet if
              an IPv6 CIDR block is associated with your VPC.
            </p>

            <p>
              To create the subnet in a Local Zone, or a Wavelength Zone, you
              must enable the Zone.
            </p>
          </>
        ),
      },
      footer: {
        notes: "Note: Your Instances will launch in the {region} region.",
      },
      fields: [
        {
          type: "card",
          label: "VPC",
          sub_label: "",
          info: null,
          fields: [
            {
              name: "az",
              label: "VPC ID",
              sub_label: "Create subnets in this VPC.",
              type: "select",
              size: 12,
              required: true,
              value: "",
              info: null,
              options: [],
            },
          ],
        },
        {
          type: "card",
          label: "Subnet settings",
          sub_label:
            "Specify the CIDR blocks and Availability Zone for the subnet.",
          info: null,
          fields: [
            {
              name: "name",
              sub_label:
                "Create a tag with a key of 'Name' and a value that you specify.",
              hint: "The name can be up to 256 characters long.",
              label: "Subnet name - optional",
              type: "text",
              error_text: "",
              required: false,
              size: 12,
              value: "",
              placeholder: "myproject-production-network-subnet-1a",
              info: (
                <>
                  <p>
                    <strong>Subnet Name:</strong> (Optional) Name to be used as
                    an identifier for the Subnet.
                  </p>
                  <p>
                    <strong>Type:</strong> string
                  </p>
                  <p>
                    <strong>Default value:</strong> "" (empty string)
                  </p>

                  <h3>Best Practices:</h3>
                  <ul>
                    <li>
                      Choose a meaningful and unique name for the VPC that
                      reflects its purpose or environment.
                    </li>
                    <li>
                      Follow a consistent naming convention for all resources to
                      improve clarity and organization.
                    </li>
                    <li>
                      <code>
                        projectName-environmentName-subnetPurpose[-additionalInfo]
                      </code>
                    </li>
                  </ul>
                  <p>
                    <strong>Example:</strong>{" "}
                    "myproject-production-network-subnet-1a"
                  </p>

                  <h3>Considerations:</h3>
                  <ul>
                    <li>
                      The Subnet name is used as an identifier for the Subnet
                      resource.
                    </li>
                    <li>
                      Ensure the name adheres to naming conventions and
                      restrictions.
                    </li>
                  </ul>

                  <h3>Validation:</h3>
                  <ul>
                    <li>
                      The name should be a string with a maximum length of 256
                      characters.
                    </li>
                    <li>
                      Allowed characters: Alphanumeric, underscores, and dashes.
                    </li>
                  </ul>

                  <h3>Note:</h3>
                  <p>
                    Use a name that helps easily identify the Subnet's purpose
                    or environment in a multi-resource environment.
                  </p>
                </>
              ),
            },
            {
              name: "az",
              label: "Availability Zone",
              sub_label:
                "Choose the zone in which your subnet will reside, or let Amazon choose one for you.",
              type: "select",
              size: 12,
              required: true,
              value: "default",
              info: (
                <>
                  <h2 style={{ borderBottom: "1px solid #eaeded" }}>
                    Availability Zones
                  </h2>
                  <p>
                    The Availability Zone where this subnet will reside. Select
                    No Preference to let Amazon choose an Availability Zone for
                    you.
                  </p>
                </>
              ),
              options: [
                {
                  value: "us-east-1a",
                  label: "US East (N. Virginia) / us-east-1a",
                },
                {
                  value: "us-east-1b",
                  label: "US East (N. Virginia) / us-east-1b",
                },
              ],
            },
            {
              name: "cidrRange",
              sub_label: "",
              hint: "",
              label: "IPv4 subnet CIDR block",
              type: "text",
              error_text: "",
              required: false,
              size: 12,
              value: "",
              placeholder: "",
              info: null,
            },
            {
              name: "map_public_ip_on_launch",
              label: "Map public IP on launch",
              sub_label: "",
              type: "select",
              size: 12,
              required: true,
              value: false,
              info: (
                <>
                  <h2 style={{ borderBottom: "1px solid #eaeded" }}>
                    Map public IP on launch
                  </h2>
                  <p>
                    Boolean flag to determine whether to automatically assign a
                    public IP to instances in this subnet.
                  </p>
                </>
              ),
              options: [
                {
                  value: false,
                  label: "False",
                },
                {
                  value: true,
                  label: "True",
                },
              ],
            },
          ],
        },
        {
          type: "card",
          label: "Tags",
          sub_label:
            "A tag is a label that you assign to an AWS resource. Each tag consists of a key and an optional value. You can use tags to search and filter your resources or track your AWS costs.",
          info: null,
          fields: [
            {
              name: "tags",
              label: "",
              sub_label: "",
              hint: "You can add 50 tags",
              type: "list<key-value>",
              size: 12,
              required: true,
              value: {
                created_by: "{{default_info.user_name}}",
              },
              config: {
                key: {
                  name: "key",
                  label: "Key",
                  sub_label: "",
                  required: true,
                  error_text: "You must specify a tag key",
                  size: 5,
                  type: "text",
                  info: null,
                },
                value: {
                  name: "value",
                  label: "Value - optional",
                  sub_label: "",
                  size: 5,
                  type: "text",
                  info: null,
                },
                add_button: {
                  label: "Add new tag",
                  variant: "outlined",
                  icon: "",
                },
                remove_button: {
                  label: "Delete",
                  variant: "outlined",
                  icon: "fa-trash",
                  style: {
                    fontSize: "24px",
                    color: "#d11a2a",
                    cursor: "pointer",
                  },
                  size: 2,
                },
              },
              info: null,
            },
          ],
        },
      ],
      handles: [
        {
          type: "target",
          position: Position.Left,
        },
      ],
    },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  security_group: {
    type: "customNode",
    component_name: "security_group",
    data: {
      header: {
        icon: "vpc",
        label: "Security Group",
        sub_label: "VPC feature",
        info: (
          <>
            <h2 style={{ borderBottom: "1px solid #eaeded" }}>
              Security Group
            </h2>
            <p>
              A security group acts as a virtual firewall that controls the
              traffic for one or more instances. When you launch an instance,
              you can specify one or more security groups. You can modify the
              rules for a security group at any time; the new rules are
              automatically applied to all instances that are associated with
              the security group. When we decide whether to allow traffic to
              reach an instance, we evaluate all the rules from all the security
              groups that are associated with the instance.
            </p>
            <p>
              When you launch an instance in a VPC, you must specify a security
              group that's created for that VPC. After you launch an instance,
              you can change its security groups. Security groups are associated
              with network interfaces. Changing an instance's security groups
              changes the security groups associated with the primary network
              interface (eth0). For more information, see Changing an Instance's
              Security Groups in the Amazon VPC User Guide. You can also change
              the security groups associated with any other network interface.
            </p>
          </>
        ),
      },
      footer: {
        notes: "Note: Your Instances will launch in the {region} region.",
      },
      fields: [
        {
          type: "card",
          label: "Basic details",
          sub_label: "",
          info: null,
          fields: [
            {
              name: "sgName",
              sub_label: "",
              hint: "Name cannot be edited after creation.",
              label: "Security group name",
              type: "text",
              error_text: "",
              required: false,
              size: 12,
              value: "",
              placeholder: "myproject-production-network-vpc-sg",
              info: (
                <>
                  <h2 style={{ borderBottom: "1px solid #eaeded" }}>
                    Security group name
                  </h2>
                  <p>
                    Name for the security group. The name can't be edited after
                    the security group is created.
                  </p>

                  <h3>Constraint</h3>
                  <p>
                    The name can be up to 255 characters long. Valid characters
                    for EC2-Classic security groups include all ASCII
                    characters. Valid characters for VPC security groups include
                    a-z, A-Z, 0-9, spaces, and ._-:/()#,@[]+=&;{}!$*.
                  </p>
                </>
              ),
            },
            {
              name: "sgDescription",
              sub_label: "",
              hint: "",
              label: "Description",
              type: "text",
              error_text: "",
              required: false,
              size: 12,
              value: "",
              placeholder: "Allows SSH access to developers",
              info: (
                <>
                  <h2 style={{ borderBottom: "1px solid #eaeded" }}>
                    Description
                  </h2>
                  <p>A description to help you identify the security group.</p>

                  <h3>Constraint</h3>
                  <p>
                    The description can be up to 255 characters long. Valid
                    characters for EC2-Classic security groups include all ASCII
                    characters. Valid characters for VPC security groups include
                    a-z, A-Z, 0-9, spaces, and ._-:/()#,@[]+=&;{}!$*.
                  </p>
                </>
              ),
            },
            {
              name: "sgVPC",
              sub_label: "",
              hint: "",
              label: "VPC",
              type: "text",
              error_text: "",
              required: false,
              size: 12,
              value: "",
              placeholder: "Select a VPC",
              info: (
                <>
                  <h2 style={{ borderBottom: "1px solid #eaeded" }}>VPC</h2>
                  <p>The VPC in which to create the security group.</p>

                  <h3>Constraint</h3>
                  <p>
                    Not choosing a VPC will result in a EC2-Classic security
                    group being created. This can only be used by classic
                    instances.
                  </p>
                </>
              ),
            },
          ],
        },
        {
          type: "card",
          label: "Inbound rules",
          sub_label: "",
          info: (
            <>
              <h2 style={{ borderBottom: "1px solid #eaeded" }}>
                Inbound rules
              </h2>
              <p>
                You can choose to add inbound and outbound rules at the time of
                creation, or you can add them at any time after you have created
                the security group. To add a security group rule, you must
                specify:
              </p>
              <ul>
                <li>The protocol to allow</li>
                <li>The range of ports to allow</li>
                <li>
                  The traffic source to allow for inbound rules, or the traffic
                  destination to allow for outbound rules
                </li>
                <li>An optional description</li>
              </ul>
            </>
          ),
          fields: [],
        },
        {
          type: "card",
          label: "Outbound rules",
          sub_label: "",
          info: (
            <>
              <h2 style={{ borderBottom: "1px solid #eaeded" }}>
                Outbound rules
              </h2>
              <p>
                You can choose to add inbound and outbound rules at the time of
                creation, or you can add them at any time after you have created
                the security group. To add a security group rule, you must
                specify:
              </p>
              <ul>
                <li>The protocol to allow</li>
                <li>The range of ports to allow</li>
                <li>
                  The traffic source to allow for inbound rules, or the traffic
                  destination to allow for outbound rules
                </li>
                <li>An optional description</li>
              </ul>
            </>
          ),
          fields: [],
        },
        {
          type: "card",
          label: "Tags",
          sub_label:
            "A tag is a label that you assign to an AWS resource. Each tag consists of a key and an optional value. You can use tags to search and filter your resources or track your AWS costs.",
          info: null,
          fields: [
            {
              name: "tags",
              label: "",
              sub_label: "",
              hint: "You can add 50 tags",
              type: "list<key-value>",
              size: 12,
              required: true,
              value: {
                created_by: "{{default_info.user_name}}",
              },
              config: {
                key: {
                  name: "key",
                  label: "Key",
                  sub_label: "",
                  required: true,
                  error_text: "You must specify a tag key",
                  size: 5,
                  type: "text",
                  info: null,
                },
                value: {
                  name: "value",
                  label: "Value - optional",
                  sub_label: "",
                  size: 5,
                  type: "text",
                  info: null,
                },
                add_button: {
                  label: "Add new tag",
                  variant: "outlined",
                  icon: "",
                },
                remove_button: {
                  label: "Delete",
                  variant: "outlined",
                  icon: "fa-trash",
                  style: {
                    fontSize: "24px",
                    color: "#d11a2a",
                    cursor: "pointer",
                  },
                  size: 2,
                },
              },
              info: null,
            },
          ],
        },
      ],
      handles: [
        {
          type: "target",
          position: Position.Left,
        },
      ],
    },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  s3: {
    type: "customNode",
    component_name: "s3",
    data: {
      header: {
        icon: "s3",
        label: "S3",
        sub_label: "Simple Storage Service",
        info: (
          <>
            <h2 style={{ borderBottom: "1px solid #eaeded" }}>
              Simple Storage Service
            </h2>
            <p>
              General purpose buckets are containers for objects stored in
              Amazon S3. You can store any number of objects in a bucket and can
              have up to 100 buckets in your account. To request an increase,
              visit the Service Quotas Console. You can create, configure,
              empty, and delete buckets. However, you can only delete an empty
              bucket.
            </p>

            <p>
              You can choose between two types of S3 buckets, general purpose
              buckets or directory buckets. A general purpose bucket is the
              default bucket type that is used for the majority of use cases in
              S3. General purpose buckets support all S3 features and most
              storage classes.
            </p>

            <ul>
              <li>
                <strong>Manage access</strong> - General purpose buckets are
                private and can only be accessed if you explicitly grant
                permissions. To review the public access settings for your
                buckets, make sure that you have the required permissions or
                you'll get an error. Use bucket policies, IAM policies, access
                control lists (ACLs), and S3 Access Points to manage access.
              </li>

              <li>
                <strong>Configure your general purpose buckets</strong> - You
                can configure your bucket to support your use case. For example,
                host a static website, use S3 Versioning and replication for
                disaster recovery, S3 Lifecycle to manage storage costs, and
                logging to track requests.
              </li>

              <li>
                <strong>Understand storage usage and activity</strong> - The S3
                Storage Lens account snapshot displays your total storage,
                object count, and average object size for all buckets in the
                account. View your S3 Storage Lens dashboard to analyze your
                usage and activity trends by AWS Region, storage class, bucket,
                or prefix.
              </li>
            </ul>
          </>
        ),
      },
      footer: {
        notes:
          "Note: Your Instances will launch in the {{default_info.region}} region.",
      },
      fields: [
        {
          type: "card",
          label: "General configuration",
          sub_label: "",
          info: null,
          fields: [
            {
              name: "region",
              sub_label: "",
              hint: "",
              label: "AWS Region",
              type: "info",
              error_text: "",
              required: false,
              disabled: true,
              size: 12,
              value: "{region}",
              placeholder: "",
              info: null,
            },
            {
              name: "bucket_type",
              label: "Bucket type",
              type: "radio",
              size: 12,
              required: true,
              value: "general_purpose",
              info: (
                <>
                  <h2 style={{ borderBottom: "1px solid #eaeded" }}>
                    Bucket type
                  </h2>
                  <p>
                    Amazon S3 supports two types of buckets. You can't change
                    the bucket type after you have created the bucket.
                  </p>
                  <ul>
                    <li>
                      {" "}
                      <strong> General purpose buckets</strong> - A general
                      purpose bucket is the default Amazon S3 bucket type.
                      General purpose buckets are recommended for the majority
                      of use cases in Amazon S3. These buckets support most
                      Amazon S3 storage classes and all Amazon S3 features.
                      <p>
                        General purpose buckets have a flat storage structure
                        instead of a hierarchical structure like you might see
                        in a file system. However, the Amazon S3 console
                        supports the folder concept as a means of grouping
                        objects by using a shared name prefix for objects in the
                        same folder. A general purpose bucket's name must be
                        globally unique and follow a specific set of bucket
                        naming rules.
                      </p>
                      <p>
                        When you create a general purpose bucket, you specify
                        the AWS Region where you want Amazon S3 to create your
                        bucket. The objects inside of your buckets are stored
                        across a minimum of three Availability Zones (AZs) in
                        the specified AWS Region.
                      </p>
                    </li>
                    <li>
                      <strong>Directory bucket</strong> - A directory bucket is
                      an Amazon S3 bucket type that is used for workloads or
                      performance-critical applications that require consistent
                      single-digit millisecond latency. Directory buckets
                      organize data hierarchically into directories, and can
                      elastically scale performance to support hundreds of
                      thousands of transactions per second (TPS). Directory
                      buckets support only the S3 Express One Zone storage class
                      and a limited set of Amazon S3 features.
                      <p>
                        You can create a directory bucket in a supported
                        Availability Zone (AZ) that you choose. Unlike general
                        purpose buckets, directory buckets exist only in a
                        single Availability Zone in a single AWS Region. For
                        optimal performance, we recommend that you co-locate
                        your directory bucket and your computer resources in the
                        same Availability Zone.
                      </p>
                      <p>
                        Directory bucket names must be unique within the chosen
                        AZ, and the AZ ID is automatically included in the
                        directory bucket name's suffix.
                      </p>
                    </li>
                  </ul>
                </>
              ),
              options: [
                {
                  value: "general_purpose",
                  label: "General purpose",
                  sub_label:
                    "Recommended for most use cases and access patterns. General purpose buckets are the original S3 bucket type. They allow a mix of storage classes that redundantly store objects across multiple Availability Zones.",
                },
                {
                  value: "directory",
                  label: "Directory - New",
                  disabled: true,
                  sub_label:
                    "Recommended for low-latency use cases. These buckets use only the S3 Express One Zone storage class, which provides faster processing of data within a single Availability Zone.",
                },
              ],
            },
            {
              depends_on: "values.bucket_type === 'general_purpose'",
              name: "cidr",
              sub_label: "",
              placeholder: "myawsbucket",
              label: "Bucket name",
              hint: "Bucket name must be unique within the global namespace and follow the bucket naming rules.",
              type: "text",
              error_text: "CIDR cannot be empty",
              required: true,
              size: 12,
              value: "",
              info: (
                <>
                  <p>
                    Amazon S3 general purpose bucket names must be unique across
                    all AWS accounts in all the AWS Regions within a partition.
                    A partition is a grouping of Regions. AWS currently has
                    three partitions: <code>aws</code> (Standard Regions),{" "}
                    <code>aws-cn</code> (China Regions), and{" "}
                    <code>aws-us-gov</code> (AWS GovCloud (US)). Because the
                    bucket name is globally unique within a partition, this
                    means the name of that bucket cannot be used by another AWS
                    account in the same partition until the bucket is deleted.
                  </p>

                  <p>
                    Do not depend on specific bucket naming conventions for
                    availability or security verification purposes.
                  </p>

                  <p>
                    In addition to being globally unique, general purpose
                    buckets must follow these bucket naming rules:
                  </p>

                  <ul>
                    <li>
                      General purpose bucket names must be between 3 and 63
                      characters long.
                    </li>

                    <li>
                      General purpose bucket names can consist only of lowercase
                      letters, numbers, periods (<code>.</code>), and hyphens (
                      <code>-</code>).
                    </li>

                    <li>
                      General purpose bucket names must begin and end with a
                      letter or number.
                    </li>

                    <li>
                      General purpose bucket names must not contain two adjacent
                      periods.
                    </li>

                    <li>
                      General purpose bucket names must not be formatted as an
                      IP address (for example, <code>192.168.5.4</code>).
                    </li>

                    <li>
                      General purpose bucket names must not start with the
                      prefix <code>xn--</code>.
                    </li>

                    <li>
                      Bucket names must not start with the prefix{" "}
                      <code>sthree-</code> or the prefix{" "}
                      <code>sthree-configurator</code>.
                    </li>
                  </ul>
                </>
              ),
            },
            {
              depends_on: "values.bucket_type === 'directory'",
              name: "directory_availability_zone",
              sub_label: "",
              placeholder: "Choose Zone",
              label: "Availability Zone",
              hint: "For optimal performance, choose an Availability Zone local to your compute services. The Availability Zone can’t be changed after the bucket is created.",
              type: "select",
              error_text: "Availability Zone selection is required.",
              required: "values.use_ipam_pool === 'directory'",
              size: 12,
              value: "",
              options: [],
              info: null,
            },
          ],
        },
        {
          type: "card",
          label: "Object Ownership",
          sub_label:
            "Control ownership of objects written to this bucket from other AWS accounts and the use of access control lists (ACLs). Object ownership determines who can specify access to objects.",
          info: (
            <>
              <h2 style={{ borderBottom: "1px solid #eaeded" }}>
                Object Ownership
              </h2>
              <p>
                Amazon S3 Object Ownership is an S3 bucket-level setting that
                you can use to both control ownership of objects that are
                uploaded to your bucket and to disable or enable access control
                lists (ACLs). For directory buckets and general purpose buckets,
                Object Ownership is automatically set to the{" "}
                <strong>Bucket owner enforced</strong> setting, and all ACLs are
                disabled. When ACLs are disabled, the bucket owner owns all the
                objects in the bucket and manages access to them exclusively by
                using access-management policies. ACLs are disabled for
                directory buckets and this setting can't be modified. For S3
                general purpose buckets, you can choose to enable ACLs however a
                majority of modern use cases in Amazon S3 no longer require the
                use of ACLs. We recommend that you keep ACLs disabled, except in
                specific circumstances where you need to control access for each
                object individually. With ACLs disabled, you can control access
                to all objects in your bucket, regardless of who uploaded the
                objects to your bucket.
              </p>
              <h2>ACLs disabled (Recommended)</h2>
              <p>
                <strong>Bucket owner enforced</strong> - Bucket and object ACLs
                are disabled, and you, as the bucket owner, automatically own
                and have full control over every object in the bucket. Access
                control for your bucket and the objects in it is based on
                policies, such as AWS Identity and Access Management (IAM) user
                policies and S3 bucket policies. Objects can be uploaded to your
                bucket only if they don't specify an ACL or if they use the{" "}
                <code>bucket-owner-full-control</code> canned ACL.
              </p>
              <h2>ACLs enabled</h2>
              <p>
                <strong>Bucket owner preferred</strong> - Bucket and object ACLs
                are accepted and honored. New objects that are uploaded with the{" "}
                <code>bucket-owner-full-control</code> canned ACL are
                automatically owned by the bucket owner instead of the object
                writer. Objects that are uploaded without this canned ACL are
                owned by the object writer. All other ACL behaviors remain in
                place. This setting does not affect ownership of existing
                objects. To require all Amazon S3
                <code>PUT</code> operations to include the{" "}
                <code>bucket-owner-full-control</code> canned ACL, add a bucket
                policy that allows only object uploads that use this ACL.
              </p>
              <p>
                <strong>Object writer</strong> - Objects are owned by the AWS
                account that uploads them, even if the object writer is in a
                different account than the bucket owner. You, as the bucket
                owner, can't use bucket policies to grant access to objects that
                are owned by other AWS accounts. To grant access to these
                objects, either the object writer or you must manage access
                permissions for these objects through object ACLs. However, you
                can't manage this access unless the object writer first grants
                you the appropriate permissions through object ACLs.
              </p>
            </>
          ),
          fields: [
            {
              name: "acl",
              label: "",
              type: "radio",
              size: 12,
              required: true,
              value: "private",
              info: null,
              options: [
                {
                  value: "private",
                  label: "ACLs disabled (recommended)",
                  sub_label:
                    "All objects in this bucket are owned by this account. Access to this bucket and its objects is specified using only policies.",
                },
                {
                  value: "public-read",
                  label: "ACLs enabled",
                  sub_label:
                    "Objects in this bucket can be owned by other AWS accounts. Access to this bucket and its objects can be specified using ACLs.",
                },
              ],
            },
          ],
        },
        {
          type: "card",
          label: "Block Public Access settings for this bucket",
          sub_label:
            "Public access is granted to buckets and objects through access control lists (ACLs), bucket policies, access point policies, or all. In order to ensure that public access to this bucket and its objects is blocked, turn on Block all public access. These settings apply only to this bucket and its access points. AWS recommends that you turn on Block all public access, but before applying any of these settings, ensure that your applications will work correctly without public access. If you require some level of public access to this bucket or objects within, you can customize the individual settings below to suit your specific storage use cases.",
          info: null,
          fields: [
            {
              name: "block_public_access",
              label: "",
              type: "checkbox",
              size: 12,
              required: true,
              value: [],
              info: null,
              options: [
                {
                  name: "block_public_acls",
                  value: true,
                  label: "Block Public ACLs (Access Control Lists)",
                  sub_label:
                    "Prevent Amazon S3 from accepting public access control lists (ACLs) for this bucket. Enabling this setting to true will disallow ACLs that permit public access. Existing policies and ACLs remain unaffected.",
                },
                {
                  name: "block_public_policy",
                  value: true,
                  label: "Block Public Bucket Policies",
                  disabled: false,
                  sub_label:
                    "By enabling this option, you prevent Amazon S3 from accepting new bucket policies that grant public access. Existing bucket policies remain unaffected. If enabled, attempts to upload new bucket policies that allow public access will be rejected. This helps maintain the security of your S3 buckets by preventing unintended public exposure of your data.",
                },
                {
                  name: "ignore_public_acls",
                  value: true,
                  label: "Ignore Public ACLs",
                  disabled: false,
                  sub_label:
                    "By enabling this option, Amazon S3 disregards public Access Control Lists (ACLs) for this bucket and any objects within it. This setting does not alter the permanence of existing ACLs nor does it inhibit the establishment of new public ACLs. By setting this attribute to true, you instruct Amazon S3 to disregard any public ACLs, thereby enhancing the security posture of the bucket and its contents against unauthorized access.",
                },
                {
                  name: "restrict_public_buckets",
                  value: true,
                  label: "Restrict Public Bucket Policies",
                  disabled: false,
                  sub_label:
                    "By enabling this option, you restricts public bucket policies for the specified bucket. By default, it is set to false. Enabling this setting does not alter previously stored bucket policies, but it prevents public and cross-account access as defined within the public bucket policy, including non-public delegation to specific accounts.",
                },
              ],
            },
          ],
        },
        {
          type: "card",
          label: "Bucket Versioning",
          sub_label:
            "Versioning is a means of keeping multiple variants of an object in the same bucket. You can use versioning to preserve, retrieve, and restore every version of every object stored in your Amazon S3 bucket. With versioning, you can easily recover from both unintended user actions and application failures.",
          info: null,
          fields: [
            {
              name: "versioning",
              label: "Bucket Versioning",
              type: "radio",
              size: "inline",
              required: true,
              value: "Enabled",
              info: null,
              options: [
                {
                  value: "Enabled",
                  label: "Enable",
                  sub_label: null,
                },
                {
                  value: "Disabled",
                  label: "Disable",
                  sub_label: null,
                },
                {
                  value: "Suspended",
                  label: "Suspend",
                  sub_label: null,
                },
              ],
            },
            {
              name: "mfa_delete",
              label: "MFA delete",
              type: "radio",
              size: "inline",
              required: true,
              value: "Enabled",
              info: null,
              options: [
                {
                  value: "Enabled",
                  label: "Enable",
                  sub_label: null,
                },
                {
                  value: "Disabled",
                  label: "Disable",
                  sub_label: null,
                },
              ],
            },
          ],
        },
        {
          type: "card",
          label: "Tags",
          sub_label:
            "A tag is a label that you assign to an AWS resource. Each tag consists of a key and an optional value. You can use tags to search and filter your resources or track your AWS costs.",
          info: null,
          fields: [
            {
              name: "tags",
              label: "",
              sub_label: "",
              hint: "You can add 50 tags",
              type: "list<key-value>",
              size: 12,
              required: true,
              value: {
                created_by: "{{default_info.user_name}}",
              },
              config: {
                key: {
                  name: "key",
                  label: "Key",
                  sub_label: "",
                  required: true,
                  error_text: "You must specify a tag key",
                  size: 5,
                  type: "text",
                  info: null,
                },
                value: {
                  name: "value",
                  label: "Value - optional",
                  sub_label: "",
                  size: 5,
                  type: "text",
                  info: null,
                },
                add_button: {
                  label: "Add new tag",
                  variant: "outlined",
                  icon: "",
                },
                remove_button: {
                  label: "Delete",
                  variant: "outlined",
                  icon: "fa-trash",
                  style: {
                    fontSize: "24px",
                    color: "#d11a2a",
                    cursor: "pointer",
                  },
                  size: 2,
                },
              },
              info: null,
            },
          ],
        },
      ],
      values: {
        region: "{{default_info.region}}",
        bucket_type: "general_purpose",
        tags: {
          created_by: "{{default_info.user_name}}",
        },
      },
      handles: [
        {
          type: "source",
          position: Position.Right,
        },
      ],
    },
  },
};

export const sidebar = {
  label: "Orchestrator",
  sub_label: "",
  icon: "",
  resources: [
    {
      label: "VPC",
      sub_label: "Virtual private cloud",
      icon: "vpc",
      component_name: "vpc",
    },
    {
      label: "Subnet",
      icon: "vpc",
      component_name: "subnet",
    },
    {
      label: "Security Group",
      icon: "vpc",
      component_name: "security_group",
    },
  ],
};

export const default_info = {
  aws: {
    region: {
      label: "AWS Region",
      sub_label: null,
      info: (
        <>
          <h2 style={{ borderBottom: "1px solid #eaeded" }}>AWS Region</h2>
          <p>
            An AWS Region is a physical location around the world where AWS
            clusters data centers. Each Region consists of multiple isolated and
            physically distinct Availability Zones within a geographic area. By
            deploying resources across multiple Availability Zones in a Region,
            you can achieve high availability and fault tolerance for your
            applications.
          </p>
          <p>
            AWS Regions are independent of each other, and each one is designed
            to be completely isolated from the others to achieve the greatest
            possible fault tolerance and stability. You can choose which
            Region(s) to use based on factors such as latency, regulatory
            compliance, and data sovereignty requirements.
          </p>
          <p>
            Some AWS services may not be available in all Regions, and the
            services available in each Region may vary. It's important to choose
            the right Region(s) for your workloads to optimize performance,
            compliance, and cost.
          </p>
        </>
      ),
      default_region: "us-east-1",
      all_regions: [
        {
          label: "US East (N. Virginia)",
          value: "us-east-1",
        },
        {
          label: "US East (Ohio)",
          value: "us-east-2",
        },
        {
          label: "US West (N. California)",
          value: "us-west-1",
        },
        {
          label: "US West (Oregon)",
          value: "us-west-2",
          isDivider: true,
        },
        {
          label: "Asia Pacific (Mumbai)",
          value: "ap-south-1",
        },
        {
          label: "Asia Pacific (Tokyo)",
          value: "ap-northeast-1",
        },
        {
          label: "Asia Pacific (Seoul)",
          value: "ap-northeast-2",
        },
        {
          label: "Asia Pacific (Osaka)",
          value: "ap-northeast-3",
        },
        {
          label: "Asia Pacific (Singapore)",
          value: "ap-southeast-1",
        },
        {
          label: "Asia Pacific (Sydney)",
          value: "ap-southeast-2",
        },
        {
          label: "Asia Pacific (Jakarta)",
          value: "ap-southeast-3",
        },
        {
          label: "Asia Pacific (Melbourne)",
          value: "ap-southeast-4",
          isDivider: true,
        },
        {
          label: "Canada (Central)",
          value: "ca-central-1",
        },
        {
          label: "Canada (Calgary)",
          value: "ca-west-1",
        },
      ],
    },
    default_tags: {
      label: "Default Tags",
      sub_label: null,
      info: (
        <>
          <h2 style={{ borderBottom: "1px solid #eaeded" }}>Default Tags</h2>
          <p>
            Default tags are key-value pairs that are automatically applied to
            AWS resources when they are created. These tags help you organize
            and manage your AWS resources more effectively by providing metadata
            associated with each resource.
          </p>
          <p>
            By defining default tags at the account level, you can ensure
            consistency in tagging across all resources within your AWS account.
            This simplifies resource management, facilitates cost allocation,
            and enables automated processes such as resource tracking and policy
            enforcement.
          </p>
        </>
      ),
      default_tags_info: {
        name: "tags",
        label: "",
        sub_label: "",
        hint: "You can add 50 tags",
        type: "list<key-value>",
        size: 12,
        required: true,
        value: {
          created_by: "{{default_info.user_name}}",
        },
        config: {
          key: {
            name: "key",
            label: "Key",
            sub_label: "",
            required: true,
            error_text: "You must specify a tag key",
            size: 5,
            type: "text",
            info: null,
          },
          value: {
            name: "value",
            label: "Value - optional",
            sub_label: "",
            size: 5,
            type: "text",
            info: null,
          },
          add_button: {
            label: "Add new tag",
            variant: "outlined",
            icon: "",
          },
          remove_button: {
            label: "Delete",
            variant: "outlined",
            icon: "fa-trash",
            style: {
              fontSize: "24px",
              color: "#d11a2a",
              cursor: "pointer",
            },
            size: 2,
          },
        },
        info: null,
      },
    },
  },
};
